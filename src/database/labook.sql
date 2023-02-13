-- Active: 1676252531961@@127.0.0.1@3306
CREATE TABLE users(
    id TEXT UNIQUE PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT(DATETIME()) NOT NULL
);
CREATE TABLE posts(
    id TEXT UNIQUE PRIMARY KEY NOT NULL,
    creator_id TEXT NOT NULL,
    content TEXT NOT NULL, 
    likes INTEGER DEFAULT(0), 
    dislikes INTEGER DEFAULT(0),
    created_at TEXT DEFAULT(DATETIME()) NOT NULL,
    updated_at TEXT DEFAULT(DATETIME()) NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users (id)
);
DROP TABLE posts;
DROP TABLE users;
DROP TABLE likes_dislikes;
CREATE TABLE likes_dislikes(
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    like INTEGER DEFAULT(0),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (post_id) REFERENCES posts (id)
);
INSERT INTO users(id, name, email, password, role)
VALUES("u001", "Sueli", "sueli@email.com", "susu1234", "usuário"),
("u002", "Marco Aurelio", "marcoaurelio@email.com", "mc2121", "usuário"),
("u003", "Paula Maria", "paulamaria@email.com", "pm1987", "usuário"),
("u004", "Maria Cristina", "mariacristina@email.com", "kiki1979", "usuário")
;
INSERT INTO posts (id, creator_id, content)
VALUES ("p001", "u002", "Nada é tão bom que não possa melhorar"), 
("p002", "u004", "O dia só começa depois do café");
SELECT*FROM users;
SELECT*FROM posts;
SELECT*FROM likes_dislikes;
