/**
 * Script pour diagnostiquer la configuration S3 en production
 */

console.log("🔍 Configuration S3 - Diagnostic");
console.log("===================================");

// Variables d'environnement requises pour S3
const requiredEnvVars = [
  'S3_BUCKET',
  'S3_ACCESS_KEY', 
  'S3_SECRET_KEY',
  'DATABASE_URL',
  'NETLIFY_DATABASE_URL',
  'PAYLOAD_SECRET'
];

console.log("\n📋 Variables d'environnement:");
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('SECRET') || varName.includes('KEY')) {
      console.log(`✅ ${varName}: ****${value.slice(-4)}`);
    } else if (varName.includes('DATABASE_URL')) {
      const maskedUrl = value.replace(/:[^:@]*@/, ':****@');
      console.log(`✅ ${varName}: ${maskedUrl}`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: MANQUANT`);
  }
});

console.log("\n🔧 Configuration Payload:");
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- NETLIFY: ${process.env.NETLIFY ? 'Oui' : 'Non'}`);

// Test de configuration S3
const testS3Config = () => {
  const bucket = process.env.S3_BUCKET;
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;
  
  if (!bucket || !accessKey || !secretKey) {
    console.log("\n❌ Configuration S3 incomplète");
    return false;
  }
  
  console.log("\n✅ Configuration S3 complète");
  console.log(`- Bucket: ${bucket}`);
  console.log(`- Région: eu-north-1`);
  console.log(`- Access Key: ****${accessKey.slice(-4)}`);
  
  return true;
};

testS3Config();

// Informations sur l'environnement d'exécution
console.log("\n🌐 Environnement d'exécution:");
console.log(`- Platform: ${process.platform}`);
console.log(`- Node version: ${process.version}`);
console.log(`- Architecture: ${process.arch}`);

export {};