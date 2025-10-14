-- Delete all tables for easier DB refreshing
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS reservation CASCADE;
DROP TABLE IF EXISTS room_amenity CASCADE;
DROP TABLE IF EXISTS app_user_roles CASCADE;
DROP TABLE IF EXISTS room CASCADE;
DROP TABLE IF EXISTS amenity CASCADE;
DROP TABLE IF EXISTS room_type CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;
DROP TABLE IF EXISTS role CASCADE;

CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE app_user (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password VARCHAR(255) NOT NULL
);

CREATE TABLE room_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    image_name VARCHAR(255)
);

CREATE TABLE amenity (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE room (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    capacity INT,
    price DOUBLE PRECISION,
    available BOOLEAN,
    room_type_id INT,
    FOREIGN KEY (room_type_id) REFERENCES room_type(id)
);

CREATE TABLE app_user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

CREATE TABLE room_amenity (
    room_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenity(id) ON DELETE CASCADE
);

CREATE TABLE reservation (
    id SERIAL PRIMARY KEY,
    app_user_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    num_guests INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE CASCADE
);

CREATE TABLE payment (
    id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL,
    stripe_payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    app_user_id INT,
    FOREIGN KEY (reservation_id) REFERENCES reservation(id) ON DELETE CASCADE,
    FOREIGN KEY (app_user_id) REFERENCES app_user(id)
);

-- Insert default roles
INSERT INTO role (name) VALUES ('USER') ON CONFLICT (name) DO NOTHING;
INSERT INTO role (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (jonathan, j@gmail.com, password: Securepassword123!)
INSERT INTO app_user (email, name, password)
VALUES (
  'j@gmail.com',
  'jonathan',
  -- password SecurePassword!23
  '$2a$10$CTvPtotuevmxdt3MSRsyBeclmyo5wqzqpvSEJTfRvD1ner.zTumhC'
);

-- Assign ADMIN role to the user
INSERT INTO app_user_roles (user_id, role_id)
SELECT u.id, r.id
FROM app_user u, role r
WHERE u.email = 'j@gmail.com' AND r.name = 'ADMIN';

-- Insert default room types
INSERT INTO room_type (name, description, image_name) VALUES
  ('Small Suite', 'Small suite accomodating a single guest', 'small_suite.jpg'),
  ('Medium Suite', 'Medium room accomodating up to 3 guests', 'medium_suite.jpg'),
  ('Large Suite', 'Spacious room accomodating up to 5 guests', 'large_suite.jpg');

-- Insert default amenities
INSERT INTO amenity (name, description) VALUES
  ('Air Conditioning', 'Keeps the room the optimal temperature'),
  ('Flat Screen TV', 'Watch whatever you want to '),
  ('Pool Access', 'Relax in the swimming pool and hot tub '),
  ('Room Service', 'Dine in with food brought to your room');

-- Insert default rooms (room_type_id references the inserted room types above)
-- Assumes IDs are assigned in the order inserted: 1=Small, 2=Medium, 3=Large
INSERT INTO room (room_number, type, capacity, price, available, room_type_id) VALUES
  ('101', 'Large Suite', 5, 1000, TRUE, 3),
  ('102', 'Medium Suite', 3, 500, TRUE, 2),
  ('103', 'Small Suite', 1, 200, TRUE, 1);

  -- Large Suite (room 101, room_type_id = 3) gets all amenities (IDs 1-4)
INSERT INTO room_amenity (room_id, amenity_id) VALUES
  (1, 1), -- Room 101, Air Conditioning
  (1, 2), -- Room 101, Flat Screen TV
  (1, 3), -- Room 101, Pool Access
  (1, 4); -- Room 101, Room Service

-- Medium Suite (room 102, room_type_id = 2) gets amenities 1, 2, 3
INSERT INTO room_amenity (room_id, amenity_id) VALUES
  (2, 1), -- Room 102, Air Conditioning
  (2, 2), -- Room 102, Flat Screen TV
  (2, 3); -- Room 102, Pool Access

-- Small Suite (room 103, room_type_id = 1) gets amenities 1, 2
INSERT INTO room_amenity (room_id, amenity_id) VALUES
  (3, 1), -- Room 103, Air Conditioning
  (3, 2); -- Room 103, Flat Screen TV