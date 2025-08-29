// Test viral content workflow tool chaining
const API_URL = 'http://localhost:3002';

async function testTool(endpoint, data) {
  console.log(`\n🧪 Testing ${endpoint}:`);
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('✅ SUCCESS:', result.message);
      return result;
    } else {
      console.log('❌ ERROR:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
    return null;
  }
}

async function testViralWorkflow() {
  console.log('🚀 Testing Viral Content Workflow Tool Chaining...');
  
  // 1. Navigate to Instagram explore
  const navResult = await testTool('/navigate', {
    url: 'https://www.instagram.com/explore/'
  });
  
  if (navResult) {
    // 2. Extract trending content data
    const extractResult = await testTool('/extract-data', {
      dataTypes: ['images', 'links'],
      limit: 10
    });
    
    if (extractResult && extractResult.extractedData.images) {
      console.log(`📊 Found ${extractResult.extractedData.images.length} trending images`);
      
      // 3. Download sample media
      const imageUrls = extractResult.extractedData.images
        .slice(0, 3)
        .map(img => img.src);
        
      if (imageUrls.length > 0) {
        const downloadResult = await testTool('/download-media', {
          urls: imageUrls,
          outputFormat: 'base64'
        });
        
        if (downloadResult) {
          console.log(`💾 Downloaded ${downloadResult.successCount} media files`);
          
          // 4. Analyze content for insights
          const analysisResult = await testTool('/analyze-content', {
            content: extractResult.extractedData.images,
            analysisTypes: ['engagement']
          });
          
          if (analysisResult) {
            console.log('🔍 Content analysis completed');
            
            // 5. Generate platform variants
            const variantResult = await testTool('/generate-variants', {
              baseContent: 'Check out this trending content! #viral #trending #socialmedia',
              platforms: ['instagram', 'twitter', 'tiktok']
            });
            
            if (variantResult) {
              console.log(`📱 Generated variants for ${Object.keys(variantResult.variants).length} platforms`);
              
              // 6. Process template for AI generation
              const templateResult = await testTool('/template-processor', {
                template: 'Create viral content about {{topic}} with style {{style}} for {{platform}}',
                data: {
                  topic: 'trending memes',
                  style: 'funny and engaging',
                  platform: 'Instagram'
                },
                templateType: 'social-media'
              });
              
              if (templateResult) {
                console.log('📝 Template processed for AI generation');
                console.log('\n🎉 WORKFLOW TEST COMPLETE!');
                console.log('\n📋 Tool Chain Summary:');
                console.log('1. ✅ Navigate → Instagram explore');
                console.log('2. ✅ Extract-data → Found trending content');
                console.log('3. ✅ Download-media → Retrieved assets');
                console.log('4. ✅ Analyze-content → Generated insights');
                console.log('5. ✅ Generate-variants → Platform-specific content');
                console.log('6. ✅ Template-processor → AI prompt ready');
                console.log('\n🤖 AI Agent can now chain these tools for complete viral workflow!');
                return true;
              }
            }
          }
        }
      }
    }
  }
  
  return false;
}

testViralWorkflow().catch(console.error);