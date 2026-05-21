-- Optional initial data. Enable with: spring.jpa.defer-datasource-initialization=true
-- Run on fresh DB only to avoid duplicates.

INSERT INTO medicines (name, description, price, stock_quantity, category) VALUES
('Paracetamol 500mg', 'Pain reliever and fever reducer', 2.99, 500, 'Pain Relief'),
('Ibuprofen 400mg', 'Anti-inflammatory pain reliever', 4.99, 300, 'Pain Relief'),
('Amoxicillin 500mg', 'Antibiotic for bacterial infections', 12.99, 150, 'Antibiotics'),
('Omeprazole 20mg', 'Acid reflux and stomach ulcer treatment', 8.99, 200, 'Digestive'),
('Loratadine 10mg', 'Antihistamine for allergies', 6.99, 250, 'Allergy');
