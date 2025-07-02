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

    // Temizle
    await Movie.deleteMany({});
    await User.deleteMany({});
    await Comment.deleteMany({});
    await Rating.deleteMany({});

    // Kullanıcılar
    const users = await User.insertMany([
      {
        email: 'john@example.com',
        password: 'Test1234!',
        firstName: 'John',
        lastName: 'Doe',
        country: 'USA',
        city: 'New York',
        profilePhoto: null
      },
      {
        email: 'ayse@example.com',
        password: 'Test1234!',
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        country: 'Turkey',
        city: 'Istanbul',
        profilePhoto: null
      }
    ]);

    // Filmler
    const movies = await Movie.insertMany([
      {
        title: 'Inception',
        summary: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
        actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'],
        director: 'Christopher Nolan',
        genre: ['Action', 'Sci-Fi'],
        releaseYear: 2010,
        duration: 148,
        imageUrl: 'https://m.media-amazon.com/images/I/51s+Q2FJ2lL._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        averageRating: 8.8,
        totalRatings: 2,
        popularityScore: 95,
        viewCount: 1000,
        totalComments: 2
      },
      {
        title: 'Interstellar',
        summary: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        actors: ['Matthew McConaughey', 'Anne Hathaway'],
        director: 'Christopher Nolan',
        genre: ['Adventure', 'Drama', 'Sci-Fi'],
        releaseYear: 2014,
        duration: 169,
        imageUrl: 'https://m.media-amazon.com/images/I/91kFYg4fX3L._AC_SY679_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        averageRating: 8.6,
        totalRatings: 2,
        popularityScore: 90,
        viewCount: 800,
        totalComments: 2
      },
      {
        title: 'The Dark Knight',
        summary: 'Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.',
        actors: ['Christian Bale', 'Heath Ledger'],
        director: 'Christopher Nolan',
        genre: ['Action', 'Crime', 'Drama'],
        releaseYear: 2008,
        duration: 152,
        imageUrl: 'https://m.media-amazon.com/images/I/51EbJjlLw-L._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        averageRating: 9.0,
        totalRatings: 3,
        popularityScore: 98,
        viewCount: 1200,
        totalComments: 3
      },
      {
        title: 'The Matrix',
        summary: 'A computer hacker learns about the true nature of his reality and his role in the war against its controllers.',
        actors: ['Keanu Reeves', 'Laurence Fishburne'],
        director: 'Lana Wachowski',
        genre: ['Action', 'Sci-Fi'],
        releaseYear: 1999,
        duration: 136,
        imageUrl: 'https://m.media-amazon.com/images/I/51EG732BV3L._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
        averageRating: 8.7,
        totalRatings: 2,
        popularityScore: 92,
        viewCount: 950,
        totalComments: 2
      },
      {
        title: 'Forrest Gump',
        summary: 'The presidencies of Kennedy and Johnson, the Vietnam War, and more through the eyes of Forrest Gump.',
        actors: ['Tom Hanks', 'Robin Wright'],
        director: 'Robert Zemeckis',
        genre: ['Drama', 'Romance'],
        releaseYear: 1994,
        duration: 142,
        imageUrl: 'https://m.media-amazon.com/images/I/61+zK+f1QSL._AC_SY679_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=bLvqoHBptjg',
        averageRating: 8.8,
        totalRatings: 2,
        popularityScore: 91,
        viewCount: 900,
        totalComments: 2
      },
      {
        title: 'Fight Club',
        summary: 'An insomniac office worker and a soap maker form an underground fight club.',
        actors: ['Brad Pitt', 'Edward Norton'],
        director: 'David Fincher',
        genre: ['Drama'],
        releaseYear: 1999,
        duration: 139,
        imageUrl: 'https://m.media-amazon.com/images/I/51v5ZpFyaFL._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=SUXWAEX2jlg',
        averageRating: 8.8,
        totalRatings: 2,
        popularityScore: 90,
        viewCount: 850,
        totalComments: 2
      },
      {
        title: 'Pulp Fiction',
        summary: 'The lives of two mob hitmen, a boxer, and others intertwine in four tales of violence and redemption.',
        actors: ['John Travolta', 'Uma Thurman'],
        director: 'Quentin Tarantino',
        genre: ['Crime', 'Drama'],
        releaseYear: 1994,
        duration: 154,
        imageUrl: 'https://m.media-amazon.com/images/I/71c05lTE03L._AC_SY679_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY',
        averageRating: 8.9,
        totalRatings: 2,
        popularityScore: 93,
        viewCount: 980,
        totalComments: 2
      },
      {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        summary: 'A meek Hobbit and eight companions set out on a journey to destroy the One Ring.',
        actors: ['Elijah Wood', 'Ian McKellen'],
        director: 'Peter Jackson',
        genre: ['Adventure', 'Drama', 'Fantasy'],
        releaseYear: 2001,
        duration: 178,
        imageUrl: 'https://m.media-amazon.com/images/I/51Qvs9i5a%2BL._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=V75dMMIW2B4',
        averageRating: 8.8,
        totalRatings: 2,
        popularityScore: 94,
        viewCount: 1100,
        totalComments: 2
      },
      {
        title: 'The Shawshank Redemption',
        summary: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption.',
        actors: ['Tim Robbins', 'Morgan Freeman'],
        director: 'Frank Darabont',
        genre: ['Drama'],
        releaseYear: 1994,
        duration: 142,
        imageUrl: 'https://m.media-amazon.com/images/I/51NiGlapXlL._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=6hB3S9bIaco',
        averageRating: 9.3,
        totalRatings: 3,
        popularityScore: 99,
        viewCount: 1300,
        totalComments: 3
      },
      {
        title: 'Gladiator',
        summary: 'A former Roman General sets out to exact vengeance against the corrupt emperor.',
        actors: ['Russell Crowe', 'Joaquin Phoenix'],
        director: 'Ridley Scott',
        genre: ['Action', 'Adventure', 'Drama'],
        releaseYear: 2000,
        duration: 155,
        imageUrl: 'https://m.media-amazon.com/images/I/51A9ZK8CZGL._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=owK1qxDselE',
        averageRating: 8.5,
        totalRatings: 2,
        popularityScore: 89,
        viewCount: 800,
        totalComments: 2
      }
    ]);

    // Yorumlar
    await Comment.insertMany([
      {
        user: users[0]._id,
        movie: movies[0]._id,
        content: 'Harika bir film!'
      },
      {
        user: users[1]._id,
        movie: movies[1]._id,
        content: 'Bilim kurgu sevenler için mükemmel.'
      },
      {
        user: users[0]._id,
        movie: movies[2]._id,
        content: 'Heath Ledger müthiş bir Joker olmuş!'
      },
      {
        user: users[1]._id,
        movie: movies[3]._id,
        content: 'Matrix felsefesi çok etkileyici.'
      },
      {
        user: users[0]._id,
        movie: movies[4]._id,
        content: 'Forrest Gump çok duygusal.'
      },
      {
        user: users[1]._id,
        movie: movies[5]._id,
        content: 'Fight Club kült bir film.'
      },
      {
        user: users[0]._id,
        movie: movies[6]._id,
        content: 'Pulp Fiction çok farklı bir anlatıma sahip.'
      },
      {
        user: users[1]._id,
        movie: movies[7]._id,
        content: 'Yüzüklerin Efendisi efsane.'
      },
      {
        user: users[0]._id,
        movie: movies[8]._id,
        content: 'Shawshank Redemption insanı derinden etkiliyor.'
      },
      {
        user: users[1]._id,
        movie: movies[9]._id,
        content: 'Gladyatör sahneleri çok iyiydi.'
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
        userCountry: 'Turkey'
      },
      {
        user: users[0]._id,
        movie: movies[2]._id,
        rating: 10,
        userCountry: 'USA'
      },
      {
        user: users[1]._id,
        movie: movies[3]._id,
        rating: 9,
        userCountry: 'Turkey'
      },
      {
        user: users[0]._id,
        movie: movies[4]._id,
        rating: 9,
        userCountry: 'USA'
      },
      {
        user: users[1]._id,
        movie: movies[5]._id,
        rating: 8,
        userCountry: 'Turkey'
      },
      {
        user: users[0]._id,
        movie: movies[6]._id,
        rating: 9,
        userCountry: 'USA'
      },
      {
        user: users[1]._id,
        movie: movies[7]._id,
        rating: 10,
        userCountry: 'Turkey'
      },
      {
        user: users[0]._id,
        movie: movies[8]._id,
        rating: 10,
        userCountry: 'USA'
      },
      {
        user: users[1]._id,
        movie: movies[9]._id,
        rating: 8,
        userCountry: 'Turkey'
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