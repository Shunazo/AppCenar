class ZoneOptimizer {
    constructor(zones) {
        this.zones = zones;
        this.graph = this.buildZoneGraph();
    }

    buildZoneGraph() {
        const graph = new Map();
        
        this.zones.forEach(zone => {
            graph.set(zone.id, {
                adjacent: new Set(),
                deliveryPoints: []
            });
        });

        // Build adjacency relationships
        for (let i = 0; i < this.zones.length; i++) {
            for (let j = i + 1; j < this.zones.length; j++) {
                if (this.zonesIntersect(this.zones[i], this.zones[j])) {
                    graph.get(this.zones[i].id).adjacent.add(this.zones[j].id);
                    graph.get(this.zones[j].id).adjacent.add(this.zones[i].id);
                }
            }
        }

        return graph;
    }

    zonesIntersect(zone1, zone2) {
        const poly1 = new google.maps.Polygon({paths: zone1.coordinates});
        const poly2 = new google.maps.Polygon({paths: zone2.coordinates});
        
        return google.maps.geometry.poly.intersects(poly1, poly2);
    }

    optimizeDeliveryRoutes(deliveryPoints) {
        const assignments = new Map();
        
        deliveryPoints.forEach(point => {
            const eligibleZones = this.findEligibleZones(point);
            const optimalZone = this.selectOptimalZone(point, eligibleZones);
            
            if (optimalZone) {
                if (!assignments.has(optimalZone.id)) {
                    assignments.set(optimalZone.id, []);
                }
                assignments.get(optimalZone.id).push(point);
            }
        });

        return this.balanceZoneLoad(assignments);
    }

    findEligibleZones(point) {
        return this.zones.filter(zone => {
            const polygon = new google.maps.Polygon({paths: zone.coordinates});
            return google.maps.geometry.poly.containsLocation(
                new google.maps.LatLng(point.lat, point.lng),
                polygon
            );
        });
    }

    selectOptimalZone(point, eligibleZones) {
        if (eligibleZones.length === 0) return null;
        
        return eligibleZones.reduce((best, zone) => {
            const currentLoad = this.graph.get(zone.id).deliveryPoints.length;
            const bestLoad = best ? this.graph.get(best.id).deliveryPoints.length : Infinity;
            
            return currentLoad < bestLoad ? zone : best;
        }, null);
    }

    balanceZoneLoad(assignments) {
        let modified = true;
        while (modified) {
            modified = false;
            
            assignments.forEach((points, zoneId) => {
                const adjacentZones = Array.from(this.graph.get(zoneId).adjacent);
                
                points.forEach(point => {
                    const betterZone = this.findBetterZone(point, zoneId, adjacentZones);
                    if (betterZone) {
                        // Move point to better zone
                        assignments.get(zoneId).splice(
                            assignments.get(zoneId).indexOf(point), 1
                        );
                        assignments.get(betterZone).push(point);
                        modified = true;
                    }
                });
            });
        }
        
        return assignments;
    }

    findBetterZone(point, currentZoneId, adjacentZones) {
        const currentLoad = this.graph.get(currentZoneId).deliveryPoints.length;
        
        return adjacentZones.find(zoneId => {
            const adjacentLoad = this.graph.get(zoneId).deliveryPoints.length;
            return adjacentLoad < currentLoad - 1 && 
                   this.isPointInZone(point, this.zones.find(z => z.id === zoneId));
        });
    }

    isPointInZone(point, zone) {
        const polygon = new google.maps.Polygon({paths: zone.coordinates});
        return google.maps.geometry.poly.containsLocation(
            new google.maps.LatLng(point.lat, point.lng),
            polygon
        );
    }
}

export default ZoneOptimizer;
