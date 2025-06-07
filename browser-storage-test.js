// Prueba de Storage de Supabase - Ejecutar en la consola del navegador
// Copia y pega este código en la consola de desarrollo del navegador (F12)

async function testSupabaseStorage() {
  console.log('🧪 Iniciando pruebas de Supabase Storage...');

  // Verificar que estamos autenticados
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ Usuario no autenticado:', userError);
    return;
  }
  console.log('✅ Usuario autenticado:', user.id);

  // Prueba 1: Listar archivos en el bucket
  console.log('\n📁 Prueba 1: Listar archivos...');
  const { data: listData, error: listError } = await supabase.storage
    .from('avatars')
    .list('', { limit: 10 });
  
  if (listError) {
    console.error('❌ Error al listar:', listError);
  } else {
    console.log('✅ Lista exitosa:', listData);
  }

  // Prueba 2: Intentar subir un archivo simple
  console.log('\n📤 Prueba 2: Subir archivo de prueba...');
  const testFile = new Blob(['test content'], { type: 'text/plain' });
  const testPath1 = `test-${user.id}.txt`; // Sin carpeta
  const testPath2 = `${user.id}/test.txt`; // Con carpeta de usuario
  
  // Probar sin carpeta
  const { data: upload1, error: error1 } = await supabase.storage
    .from('avatars')
    .upload(testPath1, testFile, { upsert: true });
  
  if (error1) {
    console.log('❌ Subida sin carpeta falló:', error1);
  } else {
    console.log('✅ Subida sin carpeta exitosa:', upload1);
  }
  
  // Probar con carpeta
  const { data: upload2, error: error2 } = await supabase.storage
    .from('avatars')
    .upload(testPath2, testFile, { upsert: true });
  
  if (error2) {
    console.log('❌ Subida con carpeta falló:', error2);
  } else {
    console.log('✅ Subida con carpeta exitosa:', upload2);
  }

  // Prueba 3: Intentar obtener URL pública
  console.log('\n🔗 Prueba 3: Obtener URL pública...');
  if (upload1) {
    const { data: publicUrl1 } = supabase.storage
      .from('avatars')
      .getPublicUrl(testPath1);
    console.log('🔗 URL sin carpeta:', publicUrl1.publicUrl);
  }
  
  if (upload2) {
    const { data: publicUrl2 } = supabase.storage
      .from('avatars')
      .getPublicUrl(testPath2);
    console.log('🔗 URL con carpeta:', publicUrl2.publicUrl);
  }

  // Prueba 4: Limpiar archivos de prueba
  console.log('\n🧹 Prueba 4: Limpiar archivos de prueba...');
  if (upload1) {
    const { error: remove1 } = await supabase.storage
      .from('avatars')
      .remove([testPath1]);
    console.log(remove1 ? '❌ Error al eliminar archivo 1:' + remove1.message : '✅ Archivo 1 eliminado');
  }
  
  if (upload2) {
    const { error: remove2 } = await supabase.storage
      .from('avatars')
      .remove([testPath2]);
    console.log(remove2 ? '❌ Error al eliminar archivo 2:' + remove2.message : '✅ Archivo 2 eliminado');
  }

  console.log('\n🎉 Pruebas completadas!');
}

// Ejecutar las pruebas
testSupabaseStorage();
