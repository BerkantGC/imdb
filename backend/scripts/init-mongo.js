db = db.getSiblingDB('imdb_app');

// Create collections
db.createCollection('users');
db.createCollection('movies');
db.createCollection('ratings');
db.createCollection('comments');
db.createCollection('watchlists');

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.movies.createIndex({ "title": 1 });
db.movies.createIndex({ "genre": 1 });
db.movies.createIndex({ "releaseDate": 1 });
db.ratings.createIndex({ "userId": 1, "movieId": 1 }, { unique: true });
db.comments.createIndex({ "movieId": 1 });
db.comments.createIndex({ "userId": 1 });
db.watchlists.createIndex({ "userId": 1, "movieId": 1 }, { unique: true });

print('Database initialized successfully');
