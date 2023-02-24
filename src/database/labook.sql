-- Active: 1676252531961@@127.0.0.1@3306
CREATE TABLE users(
    id TEXT UNIQUE PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT "NORMAL" NOT NULL,
    created_at TEXT DEFAULT(DATETIME('now', 'localtime')) NOT NULL
);
CREATE TABLE posts(
    id TEXT UNIQUE PRIMARY KEY NOT NULL,
    creator_id TEXT NOT NULL,
    content TEXT NOT NULL, 
    likes INTEGER DEFAULT(0), 
    dislikes INTEGER DEFAULT(0),
    created_at TEXT DEFAULT(DATETIME('now', 'localtime')) NOT NULL,
    updated_at TEXT DEFAULT(DATETIME('now', 'localtime')) NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE likes_dislikes(
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    like INTEGER DEFAULT(0),
    FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

DROP TABLE posts;
DROP TABLE users;
DROP TABLE likes_dislikes;

INSERT INTO users(id, name, email, password)
VALUES("u001", "Sueli", "sueli@email.com", "susu1234"),
("u002", "Marco Aurelio", "marcoaurelio@email.com", "mc2121"),
("u003", "Paula Maria", "paulamaria@email.com", "pm1987"),
("u004", "Madalena", "mariamadalena@email.com", "mada123")
;
INSERT INTO posts (id, creator_id, content)
VALUES ("p001", "u002", "Nada é tão bom que não possa melhorar"), 
("p002", "u004", "O dia só começa depois do café"), 
("p003", "u001", "You got a friend in me");
INSERT INTO likes_dislikes (user_id, post_id, like)
VALUES
("u001", "p002", 1),
("u001", "p001", 0),
("u002", "p002", 1),
("u002", "p003", 1),
("u003", "p001", 1),
("u003", "p002", 1),
("u003", "p003", 1),
("u004", "p001", 0),
("u004", "p002", 0),
("u004", "p003", 0)
;
SELECT*FROM users;
SELECT
    posts.id,
    posts.creator_id,
    posts.content,
    posts.likes,
    posts.dislikes,
    posts.created_at,
    posts.updated_at,
    users.name
FROM posts
JOIN users
ON posts.creator_id = users.id
;
SELECT*FROM likes_dislikes;
