'use strict';

// One schema, written once, turned into Oracle or SQLite SQL.
// Tokens: {ID} {STR:n} {NUM} {INT} {TS} {BOOL}

const TABLES = [
  `CREATE TABLE businesses (
    id {ID} PRIMARY KEY,
    phone {STR:20} NOT NULL,
    business_name {STR:150} NOT NULL,
    email {STR:150},
    business_type {STR:40} NOT NULL,
    address {STR:500} NOT NULL,
    landmark {STR:200},
    lat {NUM} NOT NULL,
    lng {NUM} NOT NULL,
    status {STR:20} DEFAULT 'active' NOT NULL,
    created_at {TS} NOT NULL,
    updated_at {TS} NOT NULL,
    CONSTRAINT uq_businesses_phone UNIQUE (phone)
  )`,

  `CREATE TABLE riders (
    id {ID} PRIMARY KEY,
    phone {STR:20} NOT NULL,
    full_name {STR:120} NOT NULL,
    email {STR:150},
    cnic {STR:15} NOT NULL,
    vehicle_type {STR:20} NOT NULL,
    vehicle_plate {STR:20} NOT NULL,
    city {STR:60} DEFAULT 'Lahore' NOT NULL,
    status {STR:20} DEFAULT 'offline' NOT NULL,
    rating {NUM} DEFAULT 5 NOT NULL,
    total_deliveries {INT} DEFAULT 0 NOT NULL,
    is_active {BOOL} DEFAULT 1 NOT NULL,
    last_lat {NUM},
    last_lng {NUM},
    location_at {TS},
    created_at {TS} NOT NULL,
    updated_at {TS} NOT NULL,
    CONSTRAINT uq_riders_phone UNIQUE (phone),
    CONSTRAINT uq_riders_cnic UNIQUE (cnic)
  )`,

  `CREATE TABLE orders (
    id {ID} PRIMARY KEY,
    order_number {STR:20} NOT NULL,
    tracking_code {STR:16},
    business_id {ID} NOT NULL,
    rider_id {ID},
    order_type {STR:20} NOT NULL,
    pickup_name {STR:150} NOT NULL,
    pickup_address {STR:500} NOT NULL,
    pickup_lat {NUM} NOT NULL,
    pickup_lng {NUM} NOT NULL,
    drop_name {STR:120} NOT NULL,
    drop_phone {STR:20},
    drop_address {STR:500} NOT NULL,
    drop_lat {NUM} NOT NULL,
    drop_lng {NUM} NOT NULL,
    package_details {STR:500},
    weight_kg {NUM},
    distance_km {NUM} NOT NULL,
    duration_mins {INT} NOT NULL,
    route_approximate {BOOL} DEFAULT 0 NOT NULL,
    fare {NUM} NOT NULL,
    final_fare {NUM},
    is_peak {BOOL} DEFAULT 0 NOT NULL,
    status {STR:20} NOT NULL,
    decline_count {INT} DEFAULT 0 NOT NULL,
    failure_reason {STR:300},
    created_at {TS} NOT NULL,
    accepted_at {TS},
    picked_up_at {TS},
    delivered_at {TS},
    cancelled_at {TS},
    updated_at {TS} NOT NULL,
    CONSTRAINT uq_orders_number UNIQUE (order_number),
    CONSTRAINT fk_orders_business FOREIGN KEY (business_id) REFERENCES businesses (id),
    CONSTRAINT fk_orders_rider FOREIGN KEY (rider_id) REFERENCES riders (id)
  )`,

  `CREATE TABLE order_declines (
    order_id {ID} NOT NULL,
    rider_id {ID} NOT NULL,
    reason {STR:30} NOT NULL,
    created_at {TS} NOT NULL,
    CONSTRAINT pk_order_declines PRIMARY KEY (order_id, rider_id),
    CONSTRAINT fk_declines_order FOREIGN KEY (order_id) REFERENCES orders (id),
    CONSTRAINT fk_declines_rider FOREIGN KEY (rider_id) REFERENCES riders (id)
  )`,

  `CREATE TABLE earnings (
    id {ID} PRIMARY KEY,
    rider_id {ID} NOT NULL,
    order_id {ID} NOT NULL,
    amount {NUM} NOT NULL,
    created_at {TS} NOT NULL,
    CONSTRAINT uq_earnings_order UNIQUE (order_id),
    CONSTRAINT fk_earnings_rider FOREIGN KEY (rider_id) REFERENCES riders (id),
    CONSTRAINT fk_earnings_order FOREIGN KEY (order_id) REFERENCES orders (id)
  )`,

  `CREATE TABLE menu_items (
    id {ID} PRIMARY KEY,
    business_id {ID} NOT NULL,
    item_name {STR:150} NOT NULL,
    price {NUM} NOT NULL,
    in_stock {BOOL} DEFAULT 1 NOT NULL,
    created_at {TS} NOT NULL,
    updated_at {TS} NOT NULL,
    CONSTRAINT fk_menu_business FOREIGN KEY (business_id) REFERENCES businesses (id)
  )`,

  `CREATE TABLE otp_codes (
    phone {STR:20} NOT NULL,
    user_role {STR:20} NOT NULL,
    code_hash {STR:64} NOT NULL,
    attempts {INT} DEFAULT 0 NOT NULL,
    expires_at {TS} NOT NULL,
    created_at {TS} NOT NULL,
    CONSTRAINT pk_otp_codes PRIMARY KEY (phone, user_role)
  )`,

  `CREATE TABLE support_tickets (
    id {ID} PRIMARY KEY,
    business_id {ID} NOT NULL,
    message {STR:2000} NOT NULL,
    status {STR:20} DEFAULT 'open' NOT NULL,
    created_at {TS} NOT NULL,
    CONSTRAINT fk_support_business FOREIGN KEY (business_id) REFERENCES businesses (id)
  )`,

  `CREATE TABLE daily_counters (
    counter_day {STR:8} PRIMARY KEY,
    last_value {INT} NOT NULL
  )`,
];

const INDEXES = [
  'CREATE INDEX ix_orders_business ON orders (business_id, created_at)',
  'CREATE INDEX ix_orders_rider ON orders (rider_id, status)',
  'CREATE INDEX ix_orders_status ON orders (status)',
  'CREATE INDEX ix_riders_status ON riders (status)',
  'CREATE INDEX ix_menu_business ON menu_items (business_id)',
  'CREATE INDEX ix_earnings_rider ON earnings (rider_id, created_at)',
  'CREATE UNIQUE INDEX ux_orders_tracking ON orders (tracking_code)',
];

// Columns added after the first release: [table, column, type]
const ADDED_COLUMNS = [['orders', 'tracking_code', '{STR:16}']];

const TYPES = {
  oracle: { ID: 'VARCHAR2(36)', STR: (n) => `VARCHAR2(${n} CHAR)`, NUM: 'NUMBER', INT: 'NUMBER(10)', TS: 'TIMESTAMP', BOOL: 'NUMBER(1)' },
  sqlite: { ID: 'TEXT', STR: () => 'TEXT', NUM: 'REAL', INT: 'INTEGER', TS: 'TEXT', BOOL: 'INTEGER' },
};

function render(sql, dialect) {
  const t = TYPES[dialect];
  return sql.replace(/\{(ID|STR|NUM|INT|TS|BOOL)(?::(\d+))?\}/g, (_, type, size) =>
    type === 'STR' ? t.STR(Number(size)) : t[type]
  );
}

// ALTER statements for databases created before a column existed (errors for
// "column already exists" are ignored by the adapters)
function upgradeStatements(dialect) {
  return ADDED_COLUMNS.map(([table, column, type]) =>
    dialect === 'oracle'
      ? `ALTER TABLE ${table} ADD (${column} ${render(type, dialect)})`
      : `ALTER TABLE ${table} ADD COLUMN ${column} ${render(type, dialect)}`
  );
}

function schemaStatements(dialect, { includeUpgrades = true } = {}) {
  const tables = TABLES.map((sql) => render(sql, dialect));
  if (dialect === 'sqlite') {
    return [
      ...tables.map((sql) => sql.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS')),
      ...(includeUpgrades ? upgradeStatements(dialect) : []),
      ...INDEXES.map((sql) => sql.replace(/CREATE (UNIQUE )?INDEX/, 'CREATE $1INDEX IF NOT EXISTS')),
    ];
  }
  return [...tables, ...(includeUpgrades ? upgradeStatements(dialect) : []), ...INDEXES];
}

module.exports = { schemaStatements };
