import https from 'https';

const urls = [
  'https://vazxmixizkinqaw.supabase.co/storage/v1/object/public/models/sofa/model.gltf',
  'https://vazxmixizkinqaw.supabase.co/storage/v1/object/public/models/desk/model.gltf',
  'https://vazxmixizkinqaw.supabase.co/storage/v1/object/public/models/chair-wood/model.gltf',
  'https://vazxmixizkinqaw.supabase.co/storage/v1/object/public/models/bed/model.gltf',
  'https://vazxmixizkinqaw.supabase.co/storage/v1/object/public/models/lamp/model.gltf',
  'https://vazxmixizkinqaw.supabase.co/storage/v1/object/public/models/plant/model.gltf'
];

urls.forEach(url => {
  https.request(url, { method: 'HEAD' }, res => {
    console.log(`${res.statusCode} : ${url}`);
  }).end();
});
