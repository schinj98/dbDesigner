// utils/generateSQL.js

// --- Basic MySQL/Generic SQL Generator (Refactored) ---
function generateMySQL(nodes, edges) {
    let sql = "-- Generated SQL Schema: MySQL\n\n";

    // 1. Tables (similar logic to current, but ensure MySQL-specific types like INT AUTO_INCREMENT)
    nodes.forEach((node) => {
        sql += `CREATE TABLE ${node.data.label} (\n`;
        const cols = node.data.columns || [];

        cols.forEach((col, idx) => {
            let columnDef = `  ${col.name} ${col.type}`;

            if (col.isPrimary && col.type.toUpperCase().includes("INT")) {
                columnDef += " AUTO_INCREMENT"; // MySQL specific
            }
            if (!col.isNullable) columnDef += " NOT NULL";
            if (col.isUnique) columnDef += " UNIQUE";
            if (col.defaultValue) columnDef += ` DEFAULT '${col.defaultValue}'`;

            columnDef += (idx < cols.length - 1 ? "," : "");
            sql += columnDef + "\n";
        });

        // Add PRIMARY KEY constraint line
        const pks = cols.filter(c => c.isPrimary).map(c => c.name).join(", ");
        if (pks.length > 0) {
            sql += `,  PRIMARY KEY (${pks})\n`;
        }
        
        sql += `);\n\n`;
    });

    // 2. Relations (Foreign Keys)
    edges.forEach((edge) => {
        // ... (Foreign Key logic similar to current, ensuring correct syntax)
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (!sourceNode || !targetNode) return;

        // Assuming target table gets an FK column named source_id
        const fkColumnName = `${sourceNode.data.label.toLowerCase()}_id`;

        sql += `-- ${edge.data?.relationType || "Relation"} from ${sourceNode.data.label} to ${targetNode.data.label}\n`;
        sql += `ALTER TABLE ${targetNode.data.label}\n`;
        sql += `ADD CONSTRAINT fk_${fkColumnName}\n`;
        sql += `FOREIGN KEY (${fkColumnName}) REFERENCES ${sourceNode.data.label}(id) ON DELETE CASCADE;\n\n`;
    });

    return sql;
}


// --- MongoDB Schema Export Example ---
function generateMongoDB(nodes) {
    let schema = "// Generated MongoDB Mongoose Schemas\n\n";

    nodes.forEach((node) => {
        const name = node.data.label;
        const cols = node.data.columns || [];

        const fields = cols.map(col => {
            let fieldDef = `${col.name}: { type: String`; // Simple mapping for demo
            if (col.isUnique) fieldDef += ", unique: true";
            if (!col.isNullable) fieldDef += ", required: true";
            fieldDef += " }";
            return `  ${fieldDef}`;
        }).join(",\n");

        schema += `const ${name}Schema = new mongoose.Schema({\n${fields}\n});\n\n`;
    });

    return schema;
}

// --- Main Export Function ---
export default function generateSQL(nodes, edges, dialect = 'MySQL') {
    switch (dialect) {
        case 'MySQL':
        case 'PostgreSQL': // For now, use same basic as MySQL
        case 'SQLite':
        case 'SQLServer':
            return generateMySQL(nodes, edges); // Use the generic/MySQL implementation
        case 'MongoDB':
            return generateMongoDB(nodes);
        // Add other cases (Prisma, Drizzle, etc.)
        default:
            return generateMySQL(nodes, edges);
    }
}