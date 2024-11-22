  const express = require('express');
  const { engine } = require('express-handlebars');
  const path = require('path');

  const app = express();

  const hbs = engine({
      extname: '.hbs',
      defaultLayout: 'main',
      layoutsDir: path.join(__dirname, 'views/layouts'),
      partialsDir: path.join(__dirname, 'views/partials'),
      helpers: {
          multiply: function(a, b) {
              return a * b;
          }
      }
  });

  app.engine('hbs', hbs);
  app.set('view engine', 'hbs');
  app.set('views', './views');

  app.use(express.static('public'));

  app.get('/', (req, res) => {
      const commerces = [
          {
              id: 1,
              name: "Restaurante A",
              description: "Comida italiana",
              image: "https://via.placeholder.com/300",
              isFavorite: true
          },
          {
              id: 2,
              name: "Restaurante B",
              description: "Comida mexicana",
              image: "https://via.placeholder.com/300",
              isFavorite: false
          }
      ];
    
      res.render('client/commerce-list', { commerces });
  });

  const PORT = 3000;
  app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
  });


app.get('/catalog', (req, res) => {
    const products = [
        {
            id: 1,
            name: "Pizza Margherita",
            description: "Tomate, mozzarella, albahaca",
            price: 12.99,
            image: "https://via.placeholder.com/300"
        },
        {
            id: 2,
            name: "Pasta Carbonara",
            description: "Pasta con salsa cremosa y panceta",
            price: 10.99,
            image: "https://via.placeholder.com/300"
        }
    ];
    
    res.render('client/product-catalog', { 
        commerceName: "Restaurante Italiano",
        products 
    });
});

app.get('/profile', (req, res) => {
    const user = {
        name: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+1234567890",
        avatar: "https://via.placeholder.com/150"
    };
    
    res.render('client/profile', { user });
});

app.get('/orders', (req, res) => {
    const orders = [
        {
            id: 1,
            orderNumber: "ORD-001",
            restaurantName: "Pizza Express",
            restaurantImage: "https://via.placeholder.com/50",
            date: "2024-01-15",
            total: "$35.99",
            status: "En Proceso",
            statusColor: "warning"
        },
        {
            id: 2,
            orderNumber: "ORD-002",
            restaurantName: "Burger House",
            restaurantImage: "https://via.placeholder.com/50",
            date: "2024-01-14",
            total: "$25.50",
            status: "Completado",
            statusColor: "success"
        }
    ];
    
    res.render('client/order-history', { orders });
});

app.get('/favorites', (req, res) => {
    const favorites = [
        {
            id: 1,
            name: "Italian Restaurant",
            cuisine: "Italiana",
            rating: 4.5,
            reviews: 128,
            deliveryTime: 30,
            location: "Calle Principal 123",
            image: "https://via.placeholder.com/300"
        },
        {
            id: 2,
            name: "Sushi Master",
            cuisine: "Japonesa",
            rating: 4.8,
            reviews: 256,
            deliveryTime: 45,
            location: "Avenida Central 456",
            image: "https://via.placeholder.com/300"
        }
    ];
    
    res.render('client/favorites', { favorites });
});
