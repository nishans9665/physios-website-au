import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const directories = ['public/images', 'src/assets/hero'];

async function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      await processDirectory(fullPath);
    } else if (item.isFile() && item.name.toLowerCase().endsWith('.jpeg')) {
      const parsed = path.parse(fullPath);
      const newPath = path.join(parsed.dir, parsed.name + '.png');
      
      console.log(`Converting ${fullPath} to PNG...`);
      try {
        const metadata = await sharp(fullPath).metadata();
        let pipeline = sharp(fullPath);
        
        // Resize if it's too large to save space
        if (metadata.width > 1920) {
          pipeline = pipeline.resize({ width: 1920, withoutEnlargement: true });
        }

        await pipeline
          .png({ 
            compressionLevel: 9,
            quality: 75
          })
          .toFile(newPath);
          
        // Delete old file
        fs.unlinkSync(fullPath);
        console.log(`Successfully converted to ${newPath} and deleted original.`);
      } catch (err) {
        console.error(`Error converting ${fullPath}:`, err);
      }
    }
  }
}

async function run() {
  for (const dir of directories) {
    await processDirectory(dir);
  }
  console.log("Conversion complete.");
}

run();
