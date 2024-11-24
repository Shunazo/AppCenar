const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // Sample featured restaurants data
    const featuredRestaurants = [
        {
            id: 1,
            name: "La Pizzería Italiana",
            image: "/img/restaurants/pizza.jpg",
            rating: 4.8,
            description: "Las mejores pizzas artesanales",
            deliveryTime: "30-45 min"
        },
        {
            id: 2,
            name: "Burger House",
            image: "/img/restaurants/burger.jpg",
            rating: 4.6,
            description: "Hamburguesas gourmet",
            deliveryTime: "25-40 min"
        },
        {
            id: 3,
            name: "Sushi Master",
            image: "/img/restaurants/sushi.jpg",
            rating: 4.9,
            description: "Sushi de primera calidad",
            deliveryTime: "35-50 min"
        }
    ];

    res.render('home', {
        title: 'AppCenar - Comida a Domicilio',
        featuredRestaurants
    });
});

module.exports = router;
