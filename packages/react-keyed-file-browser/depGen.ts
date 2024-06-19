import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

const projectDir = path.resolve(__dirname, process.cwd());

// Function to get the full code of a file
const getFileCode = (filePath: string): string => {
    return fs.readFileSync(filePath, 'utf8');
};

// Function to find all dependencies of a given source file
const findDependencies = (filePath: string): Set<string> => {
    const sourceFile = ts.createSourceFile(filePath, getFileCode(filePath), ts.ScriptTarget.Latest, true);
    const dependencies = new Set<string>();

    const visit = (node: ts.Node) => {
        if (ts.isImportDeclaration(node)) {
            const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
            const absoluteImportPath = path.resolve(path.dirname(filePath), importPath + '.ts');
            dependencies.add(absoluteImportPath);
        }
        ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return dependencies;
};

// Function to recursively find all dependencies
const findAllDependencies = (filePath: string, allDependencies: Set<string>) => {
    const dependencies = findDependencies(filePath);
    dependencies.forEach(dep => {
        if (!allDependencies.has(dep)) {
            allDependencies.add(dep);
            findAllDependencies(dep, allDependencies);
        }
    });
};

// Main function to generate the full code with dependencies
const generateFullCodeWithDependencies = (entityName: string, entityFilePath: string) => {
    const allDependencies = new Set<string>();
    findAllDependencies(entityFilePath, allDependencies);

    const resultFilePath = path.resolve(projectDir, `${entityName}-full-code.txt`);
    const resultStream = fs.createWriteStream(resultFilePath, { flags: 'w' });

    // Write all dependencies' code to the result file
    allDependencies.forEach(dep => {
        const code = getFileCode(dep);
        resultStream.write(`// File: ${dep}\n\n`);
        resultStream.write(code);
        resultStream.write(`\n\n`);
    });

    // Write the main entity's code to the result file
    const entityCode = getFileCode(entityFilePath);
    resultStream.write(`// File: ${entityFilePath}\n\n`);
    resultStream.write(entityCode);
    resultStream.end();
};

// Access the user-provided arguments
const firstArgument = process.argv[2];

// Check if the arguments are provided
if (!firstArgument) {
    console.error('Please provide the entity to generate scratch docs for as an argument.');
    process.exit(1);
}

// Replace these with the class, type, or interface you want to generate code for
const entityName = process.argv[2]; // The name of the class, type, or interface

let entityFilePath = findEntity(entityName);
if (entityFilePath) {
    console.log(`Found ${entityName} in file: ${filePath}`);
    entityFilePath = path.resolve(projectDir, entityFilePath);
    generateFullCodeWithDependencies(entityName, entityFilePath);
} else {
    console.log(`Could not find ${entityName} in any file.`);
}

