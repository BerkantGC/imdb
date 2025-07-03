// Basit seed scripti: node scripts/seed.js ile çalıştırılır
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/moviesapp';

async function seed() {
  if (!MONGO_URI) {
    console.error('MongoDB URI is required! Please set MONGODB_URI in .env file');
    process.exit(1);
  }
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Kullanıcılar
    const users = await User.insertMany([
      {
        email: 'alex@example.com',
        password: 'Alex123!',
        firstName: 'Alex',
        lastName: 'Johnson',
        country: 'USA',
        city: 'New York',
        profilePhoto: null
      },
      {
        email: 'emma@example.com',
        password: 'Emma456*',
        firstName: 'Emma',
        lastName: 'Williams',
        country: 'UK',
        city: 'London',
        profilePhoto: null
      },
      {
        email: 'mehmet@example.com',
        password: 'Mehmet789!',
        firstName: 'Mehmet',
        lastName: 'Özkan',
        country: 'Turkey',
        city: 'Ankara',
        profilePhoto: null
      }
    ]);

    // Filmler
    const movies = await Movie.insertMany([
      {
        title: 'Inception',
        summary: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
        actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Marion Cotillard'],
        director: 'Christopher Nolan',
        genre: ['Action', 'Sci-Fi', 'Thriller'],
        releaseYear: 2010,
        duration: 148,
        imageUrl: 'https://m.media-amazon.com/images/I/51s+Q2FJ2lL._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        averageRating: 8.7,
        totalRatings: 3,
        popularityScore: 94,
        viewCount: 1150,
        totalComments: 3
      },
      {
        title: 'Parasite',
        summary: 'A poor family schemes to become employed by a wealthy family by infiltrating their household.',
        actors: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
        director: 'Bong Joon-ho',
        genre: ['Comedy', 'Drama', 'Thriller'],
        releaseYear: 2019,
        duration: 132,
        imageUrl: 'https://m.media-amazon.com/images/I/71f4WYlFriL._AC_SY679_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
        averageRating: 8.5,
        totalRatings: 2,
        popularityScore: 87,
        viewCount: 920,
        totalComments: 2
      },
      {
        title: 'Spirited Away',
        summary: 'During her family\'s move to the suburbs, a 10-year-old girl wanders into a world ruled by spirits.',
        actors: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
        director: 'Hayao Miyazaki',
        genre: ['Animation', 'Adventure', 'Family'],
        releaseYear: 2001,
        duration: 125,
        imageUrl: 'https://m.media-amazon.com/images/I/51hcCDvRZBL._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
        averageRating: 9.1,
        totalRatings: 3,
        popularityScore: 96,
        viewCount: 1280,
        totalComments: 3
      },
      {
        title: 'Dune',
        summary: 'A noble family becomes embroiled in a war for control over the galaxy\'s most valuable asset.',
        actors: ['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac'],
        director: 'Denis Villeneuve',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        releaseYear: 2021,
        duration: 155,
        imageUrl: 'https://m.media-amazon.com/images/I/71jGcQyxgNL._AC_SY679_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=n9xhJrPXop4',
        averageRating: 8.2,
        totalRatings: 2,
        popularityScore: 85,
        viewCount: 780,
        totalComments: 2
      },
      {
        title: 'La La Land',
        summary: 'A jazz musician and an aspiring actress meet and fall in love in Los Angeles.',
        actors: ['Ryan Gosling', 'Emma Stone', 'John Legend'],
        director: 'Damien Chazelle',
        genre: ['Comedy', 'Drama', 'Music'],
        releaseYear: 2016,
        duration: 128,
        imageUrl: 'https://m.media-amazon.com/images/I/71vPyJZCupL._AC_SY679_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=0pdqf4P9MB8',
        averageRating: 8.0,
        totalRatings: 3,
        popularityScore: 82,
        viewCount: 650,
        totalComments: 3
      },
      {
        title: 'Blade Runner 2049',
        summary: 'A young blade runner discovers a secret that could plunge society into chaos.',
        actors: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas'],
        director: 'Denis Villeneuve',
        genre: ['Action', 'Drama', 'Sci-Fi'],
        releaseYear: 2017,
        duration: 164,
        imageUrl: 'https://m.media-amazon.com/images/I/61S5s5lMzpL._AC_SY679_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
        averageRating: 8.9,
        totalRatings: 2,
        popularityScore: 91,
        viewCount: 1050,
        totalComments: 2
      },
      {
        title: 'The Grand Budapest Hotel',
        summary: 'The adventures of a legendary concierge at a famous European hotel.',
        actors: ['Ralph Fiennes', 'F. Murray Abraham', 'Mathieu Amalric'],
        director: 'Wes Anderson',
        genre: ['Adventure', 'Comedy', 'Crime'],
        releaseYear: 2014,
        duration: 99,
        imageUrl: 'https://m.media-amazon.com/images/I/71zp2FZBIdL._AC_SY679_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=1Fg5iWmQjwk',
        averageRating: 8.4,
        totalRatings: 2,
        popularityScore: 79,
        viewCount: 590,
        totalComments: 2
      },
      {
        title: 'Mad Max: Fury Road',
        summary: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler.',
        actors: ['Tom Hardy', 'Charlize Theron', 'Nicholas Hoult'],
        director: 'George Miller',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        releaseYear: 2015,
        duration: 120,
        imageUrl: 'https://m.media-amazon.com/images/I/61kTpJo-9UL._AC_SY679_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=hEJnMQG9ev8',
        averageRating: 8.6,
        totalRatings: 3,
        popularityScore: 88,
        viewCount: 870,
        totalComments: 3
      },
      {
        title: 'Moonlight',
        summary: 'A young African-American man grapples with his identity and sexuality.',
        actors: ['Trevante Rhodes', 'André Holland', 'Janelle Monáe'],
        director: 'Barry Jenkins',
        genre: ['Drama'],
        releaseYear: 2016,
        duration: 111,
        imageUrl: 'https://m.media-amazon.com/images/I/71ghgX1+wpL._AC_SY679_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=9NJj12tJzqc',
        averageRating: 8.3,
        totalRatings: 2,
        popularityScore: 76,
        viewCount: 520,
        totalComments: 2
      },
      {
        title: 'Everything Everywhere All at Once',
        summary: 'A Chinese-American woman gets caught up in an insane adventure.',
        actors: ['Michelle Yeoh', 'Stephanie Hsu', 'Ke Huy Quan'],
        director: 'Daniels',
        genre: ['Action', 'Adventure', 'Comedy'],
        releaseYear: 2022,
        duration: 139,
        imageUrl: 'https://m.media-amazon.com/images/I/71iTjLIjlHL._AC_SY679_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=WLcq7RllyNw',
        averageRating: 9.2,
        totalRatings: 3,
        popularityScore: 98,
        viewCount: 1400,
        totalComments: 3
      }
    ]);

    // Yorumlar
    await Comment.insertMany([
      {
        user: users[0]._id,
        movie: movies[0]._id,
        content: 'Mind-bending masterpiece! Nolan at his finest.'
      },
      {
        user: users[1]._id,
        movie: movies[1]._id,
        content: 'Brilliant social commentary wrapped in a thriller.'
      },
      {
        user: users[2]._id,
        movie: movies[2]._id,
        content: 'Miyazaki\'s animation is pure magic!'
      },
      {
        user: users[0]._id,
        movie: movies[3]._id,
        content: 'Villeneuve created a stunning visual feast.'
      },
      {
        user: users[1]._id,
        movie: movies[4]._id,
        content: 'The music and cinematography are phenomenal.'
      },
      {
        user: users[2]._id,
        movie: movies[5]._id,
        content: 'A worthy sequel that expands the universe beautifully.'
      },
      {
        user: users[0]._id,
        movie: movies[6]._id,
        content: 'Wes Anderson\'s unique style is perfectly executed.'
      },
      {
        user: users[1]._id,
        movie: movies[7]._id,
        content: 'Non-stop action with incredible practical effects!'
      },
      {
        user: users[2]._id,
        movie: movies[8]._id,
        content: 'A deeply moving and powerful story.'
      },
      {
        user: users[0]._id,
        movie: movies[9]._id,
        content: 'Absolutely insane in the best possible way!'
      }
    ]);

    // Ratingler
    await Rating.insertMany([
      {
        user: users[0]._id,
        movie: movies[0]._id,
        rating: 9,
        userCountry: 'USA'
      },
      {
        user: users[1]._id,
        movie: movies[1]._id,
        rating: 8,
        userCountry: 'UK'
      },
      {
        user: users[2]._id,
        movie: movies[2]._id,
        rating: 10,
        userCountry: 'Turkey'
      },
      {
        user: users[0]._id,
        movie: movies[3]._id,
        rating: 8,
        userCountry: 'USA'
      },
      {
        user: users[1]._id,
        movie: movies[4]._id,
        rating: 7,
        userCountry: 'UK'
      },
      {
        user: users[2]._id,
        movie: movies[5]._id,
        rating: 9,
        userCountry: 'Turkey'
      },
      {
        user: users[0]._id,
        movie: movies[6]._id,
        rating: 8,
        userCountry: 'USA'
      },
      {
        user: users[1]._id,
        movie: movies[7]._id,
        rating: 9,
        userCountry: 'UK'
      },
      {
        user: users[2]._id,
        movie: movies[8]._id,
        rating: 8,
        userCountry: 'Turkey'
      },
      {
        user: users[0]._id,
        movie: movies[9]._id,
        rating: 10,
        userCountry: 'USA'
      }
    ]);

    console.log('Mock data eklendi!');
  } catch (error) {
    console.error('Error connecting to MongoDB or seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch(e => {
  console.error(e);
  mongoose.disconnect();
});