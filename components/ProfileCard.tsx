"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import Image from 'next/image';
import { User } from '@supabase/supabase-js'; // Ya estaba
import CountrySelector from './CountrySelector';
import { useTranslation } from 'react-i18next';
// import { Database } from '../supabase.types'; // Asumimos que existe o se creará

// type Profile = Database['public']['Tables']['profiles']['Row']; // Idealmente usar esto
// Por ahora, definimos una interfaz local más explícita si Database no está lista
interface ProfileData {
  id: string;
  user_id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  real_name: string | null;
  location: string | null;
  birthdate: string | null; // Considerar tipo Date si se maneja como tal
  privacy: {
    real_name: boolean;
    location: boolean;
    birthdate: boolean;
  } | null;
  preferences: {
    theme: string;
    language: string;
    visibility: string;
  } | null;
  created_at?: string;
  last_seen?: string;
  stats: {
    games_played: number;
    rooms_created: number;
  } | null;
}

const defaultProfileData: ProfileData = {
  id: '',
  user_id: '',
  username: '',
  email: '',
  avatar_url: '/logo.png',
  bio: '',
  real_name: '',
  location: '',
  birthdate: '',
  privacy: {
    real_name: false,
    location: false,
    birthdate: false,
  },
  preferences: {
    theme: 'auto',
    language: 'es',
    visibility: 'public',
  },
  stats: {
    games_played: 0,
    rooms_created: 0,
  },
};

export default function ProfileCard() {
  const { t, i18n } = useTranslation(['profile', 'common']);
  const [profile, setProfile] = useState<ProfileData>(defaultProfileData);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // const [userId, setUserId] = useState(''); // Derivado de sessionUser
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar usuario y perfil
  useEffect(() => {
    async function fetchUserAndProfile() {
      setLoading(true);
      setError('');
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError(authError?.message || 'No hay usuario logueado. Por favor, inicia sesión.');
        setLoading(false);
        // Podrías redirigir al login aquí si es necesario
        return;
      }
      setSessionUser(user);

      // Buscar perfil existente
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<ProfileData>(); // Especificar el tipo aquí

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116: no rows found
        setError('Error al cargar el perfil: ' + profileError.message);
        setLoading(false);
        return;
      }

      if (profileData) {
        setProfile({
          ...defaultProfileData, // Asegura que todos los campos tengan valor por defecto
          ...profileData,
          username: profileData.username || user.user_metadata?.username || user.email?.split('@')[0] || 'Usuario',
          email: profileData.email || user.email || '',
          avatar_url: profileData.avatar_url || user.user_metadata?.avatar_url || '/logo.png',
          // Asegurar que los objetos anidados no sean null
          privacy: profileData.privacy || defaultProfileData.privacy,
          preferences: profileData.preferences || defaultProfileData.preferences,
          stats: profileData.stats || defaultProfileData.stats,
        });
        
        // Sincronizar el idioma del perfil con i18n si es diferente
        const profileLanguage = profileData.preferences?.language || 'es';
        if (profileLanguage !== i18n.language) {
          i18n.changeLanguage(profileLanguage);
        }
      } else {
        // No hay perfil, crear uno nuevo con datos del usuario autenticado
        const newUsername = user.user_metadata?.username || user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`;
        const initialProfile: ProfileData = {
          ...defaultProfileData,
          id: user.id,
          user_id: user.id,
          username: newUsername,
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url || '/logo.png',
        };
        setProfile(initialProfile);

        // Guardar el perfil inicial en la base de datos
        const { error: upsertError } = await supabase.from('profiles').upsert(initialProfile);
        if (upsertError) {
          setError('Error al crear el perfil inicial: ' + upsertError.message);
          // No necesariamente bloquear la UI, el perfil se muestra localmente
        } else {
          setSuccess('Perfil inicial creado. ¡Puedes editarlo!');
        }
      }
      setLoading(false);
    }
    fetchUserAndProfile();
  }, [i18n]);

  // Validaciones
  function validate() {
    if (profile.bio && profile.bio.length > 250) return t('profile.form.validation.bioTooLong'); // Aumentado límite
    if (profile.real_name && profile.real_name.length > 50) return t('profile.form.validation.realNameTooLong');
    // La ubicación ahora es un selector de países, no necesita validación de longitud
    // No se valida username aquí ya que es de solo lectura en este formulario
    return '';
  }

  // Manejar cambio de idioma
  function handleLanguageChange(newLanguage: string) {
    // Actualizar el perfil local
    setProfile(p => ({ 
      ...p, 
      preferences: { 
        ...p.preferences!, 
        language: newLanguage 
      } 
    }));
    
    // Cambiar el idioma global de la aplicación inmediatamente
    i18n.changeLanguage(newLanguage);
  }

  // Guardar cambios
  async function handleSave() {
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    if (!sessionUser) {
      setError('Sesión no válida. Por favor, recarga la página.');
      return;
    }

    setLoading(true);

    const profileToSave: Partial<ProfileData> = {
      // id y user_id no se deben cambiar aquí, se usan para el 'eq' en upsert
      // username no se actualiza desde este formulario, se gestiona en el registro o por el sistema
      email: profile.email, // Aunque el email usualmente viene de auth, permitir si se quiere sincronizar
      bio: profile.bio,
      real_name: profile.real_name,
      location: profile.location,
      birthdate: profile.birthdate,
      privacy: profile.privacy,
      preferences: profile.preferences,
      avatar_url: profile.avatar_url,
      // stats se actualizan por otros medios, no directamente por el usuario
    };

    const { error: upsertError } = await supabase
      .from('profiles')
      .update(profileToSave) // Usar update en lugar de upsert si el ID ya está garantizado
      .eq('id', sessionUser.id);

    if (upsertError) {
      setError('Error al guardar el perfil: ' + upsertError.message);
    } else {
      setSuccess('¡Perfil actualizado con éxito!');
      setEditMode(false);
      // Opcional: Recargar el perfil para asegurar consistencia, aunque el estado local ya está actualizado
      // const { data: updatedProfileData } = await supabase.from('profiles').select('*').eq('id', sessionUser.id).single<ProfileData>();
      // if (updatedProfileData) setProfile(prev => ({...prev, ...updatedProfileData}));
    }
    setLoading(false);
  }

  // Subir avatar
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log('🎯 handleAvatarChange iniciado');
    
    if (!sessionUser) {
      console.error('❌ Usuario no autenticado');
      setError('Usuario no autenticado.');
      return;
    }
    
    console.log('✅ Usuario autenticado:', sessionUser.id, sessionUser.email);
    
    const file = e.target.files && e.target.files[0];
    if (!file) {
      console.log('❌ No se seleccionó archivo');
      return;
    }

    console.log('📁 Archivo seleccionado:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    if (file.size > 2 * 1024 * 1024) { // Límite de 2MB
        console.error('❌ Archivo demasiado grande:', file.size);
        setError('El archivo es demasiado grande (máximo 2MB).');
        return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      console.error('❌ Tipo de archivo no válido:', file.type);
      setError('Por favor selecciona una imagen válida.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Verificar autenticación actual
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !currentUser) {
        console.error('❌ Error de autenticación al verificar:', authError);
        setError('Error de autenticación. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }
      
      console.log('✅ Autenticación verificada:', currentUser.id);

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      // Usar estructura de carpetas compatible con las políticas RLS
      const filePath = `${sessionUser.id}/avatar.${fileExt}`;

      console.log('📍 Iniciando subida de avatar para usuario:', sessionUser.id);
      console.log('📁 Ruta de archivo:', filePath);
      console.log('🖼️ Tipo de archivo:', file.type);
      console.log('📏 Tamaño de archivo:', file.size, 'bytes');
      console.log('🔐 Usuario actual auth:', currentUser.id);

      // Eliminar archivo anterior si existe
      console.log('🗑️ Intentando eliminar archivo anterior...');
      const { error: removeError } = await supabase.storage.from('avatars').remove([filePath]);
      if (removeError) {
        console.log('ℹ️ No se pudo eliminar archivo anterior (esto es normal):', removeError.message);
      } else {
        console.log('✅ Archivo anterior eliminado exitosamente');
      }

      // Subir nuevo archivo
      console.log('📤 Iniciando subida de archivo...');
      console.log('📤 Bucket: avatars');
      console.log('📤 Ruta:', filePath);
      console.log('📤 Opciones:', { cacheControl: '3600', upsert: true });
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) {
        console.error('❌ Error detallado de subida:', {
          message: uploadError.message,
          error: uploadError,
          fullError: JSON.stringify(uploadError, null, 2)
        });
        setError(`Error al subir avatar: ${uploadError.message}. Detalles: ${JSON.stringify(uploadError)}`);
        setLoading(false);
        return;
      }

      console.log('✅ Subida exitosa:', data);

      // Obtener URL pública
      console.log('🔗 Obteniendo URL pública...');
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      console.log('🔗 Datos de URL pública:', publicUrlData);
      
      if (!publicUrlData?.publicUrl) {
          console.error('❌ No se pudo obtener URL pública');
          setError('No se pudo obtener la URL pública del avatar.');
          setLoading(false);
          return;
      }

      const newAvatarUrl = publicUrlData.publicUrl;
      console.log('🔗 Nueva URL del avatar:', newAvatarUrl);

      // Actualizar la URL del avatar en la tabla de perfiles
      console.log('💾 Actualizando perfil en base de datos...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', sessionUser.id);

      if (updateError) {
        console.error('❌ Error al actualizar perfil:', updateError);
        setError('Error al actualizar el avatar en el perfil: ' + updateError.message);
      } else {
        console.log('✅ Perfil actualizado exitosamente');
        setProfile(p => ({ ...p, avatar_url: newAvatarUrl }));
        setSuccess('Avatar actualizado correctamente.');
      }
    } catch (err) {
      console.error('❌ Error inesperado en handleAvatarChange:', err);
      setError('Error inesperado al subir el avatar.');
    }
    
    setLoading(false);
  }

  // Renderizado
  if (loading && !profile.id) return <div className="bg-black text-white p-6 rounded-2xl border border-violet-600 animate-pulse">{t('common:loading.profile')}</div>;
  if (error && !profile.id) return <div className="bg-black text-red-500 p-6 rounded-2xl border border-red-600">Error: {error}</div>;
  if (!sessionUser) return <div className="bg-black text-yellow-500 p-6 rounded-2xl border border-yellow-600">Por favor, inicia sesión para ver tu perfil.</div>

  // Asegurar que stats, privacy y preferences nunca sean null para el renderizado
  const displayProfile = {
    ...profile,
    username: profile.username || sessionUser.user_metadata?.username || sessionUser.email?.split('@')[0] || 'Usuario',
    email: profile.email || sessionUser.email || '',
    avatar_url: profile.avatar_url || sessionUser.user_metadata?.avatar_url || '/logo.png',
    stats: profile.stats || defaultProfileData.stats,
    privacy: profile.privacy || defaultProfileData.privacy,
    preferences: profile.preferences || defaultProfileData.preferences,
  };

  // Extract for easier access in render
  const privacy = displayProfile.privacy!;
  const preferences = displayProfile.preferences!;
  const stats = displayProfile.stats!;

  return (
    <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-xl border border-violet-700 max-w-2xl w-full mx-auto my-8">
      {/* Mensajes de estado globales */} 
      {loading && <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-md text-sm animate-pulse">Guardando...</div>}
      {error && <div className="mb-4 p-3 bg-red-700 text-white rounded-md text-sm">Error: {error}</div>}
      {success && <div className="mb-4 p-3 bg-green-700 text-white rounded-md text-sm">Éxito: {success}</div>}

      {/* Información básica */} 
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6 pb-6 border-b border-neutral-700">
        <div className="relative group">
          <Image 
            src={displayProfile.avatar_url!}
            alt={`Avatar de ${displayProfile.username}`}
            width={96} 
            height={96} 
            className="w-24 h-24 rounded-full border-2 border-violet-500 object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
            priority={false}
            sizes="96px"
            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} // Fallback si la URL es inválida
          />
          {editMode && (
            <>
              <input
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                ref={fileInputRef}
                className="hidden" // Oculto, se activa con el botón
                title="Cambiar avatar"
                aria-label="Cambiar avatar"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-violet-600 hover:bg-violet-500 text-white rounded-full flex items-center justify-center text-lg shadow-md transition-transform duration-300 hover:scale-110"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Subir nuevo avatar"
              >
                📷
              </button>
            </>
          )}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-violet-400 truncate max-w-xs sm:max-w-md" title={displayProfile.username!}>{displayProfile.username}</h2>
          <p className="text-sm text-gray-400 truncate max-w-xs sm:max-w-md" title={displayProfile.email!}>{displayProfile.email}</p>
          <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
            <span className={`w-3 h-3 rounded-full ${sessionUser?.id ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
            <span className="text-sm text-gray-300">{sessionUser?.id ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
      
      {/* Bio Section */}
      <div className="mb-6 pb-6 border-b border-neutral-700">
        <label className="block text-violet-400 font-semibold mb-2">{t('profile.biography')}</label>
        {editMode ? (
          <textarea 
            className="bg-neutral-900 border border-violet-700 rounded px-3 py-2 w-full text-white resize-none" 
            value={profile.bio || ''} 
            maxLength={250} 
            rows={3}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} 
            placeholder={t('profile.biography_placeholder')} 
            aria-label="Biografía"
          />
        ) : (
          <p className="text-gray-300 text-sm leading-relaxed min-h-[3rem]">
            {profile.bio || t('profile.no_biography')}
          </p>
        )}
        {editMode && (
          <div className="text-xs text-gray-500 mt-1">
            {(profile.bio || '').length}/250 {t('profile.characters')}
          </div>
        )}
      </div>

      {/* Personal Information Grid */}
      <div className="mb-6 pb-6 border-b border-neutral-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:ml-auto">
          <label className="block text-violet-400 font-semibold mb-1">{t('profile.real_name')}</label>
          {editMode ? (
            <input className="bg-neutral-900 border border-violet-700 rounded px-2 py-1 w-full text-white" value={profile.real_name || ''} maxLength={40} onChange={e => setProfile(p => ({ ...p, real_name: e.target.value }))} placeholder={t('profile.real_name_placeholder')} aria-label="Nombre real" />
          ) : (
            <span>{privacy.real_name ? profile.real_name : t('profile.private')}</span>
          )}
          {editMode && (
            <label className="block text-xs mt-1">
              <input
                type="checkbox"
                checked={privacy.real_name}
                onChange={e => setProfile(p => ({
                  ...p,
                  privacy: { ...privacy, real_name: e.target.checked }
                }))}
              /> {t('profile.show')}
            </label>
          )}
        </div>
        <div>
          <label className="block text-violet-400 font-semibold mb-1">{t('profile.location')}</label>
          {editMode ? (
            <CountrySelector
              value={profile.location || ''}
              onChange={(country) => setProfile(p => ({ ...p, location: country }))}
              placeholder={t('profile.select_country')}
              className="w-full"
            />
          ) : (
            <span>{privacy.location ? profile.location || t('profile.not_specified') : t('profile.private')}</span>
          )}
          {editMode && (
            <label className="block text-xs mt-1">
              <input
                type="checkbox"
                checked={privacy.location}
                onChange={e => setProfile(p => ({
                  ...p,
                  privacy: { ...privacy, location: e.target.checked }
                }))}
              /> {t('profile.show')}
            </label>
          )}
        </div>
        <div>
          <label className="block text-violet-400 font-semibold mb-1">{t('profile.birthdate')}</label>
          {editMode ? (
            <input type="date" className="bg-neutral-900 border border-violet-700 rounded px-2 py-1 w-full text-white" value={profile.birthdate || ''} onChange={e => setProfile(p => ({ ...p, birthdate: e.target.value }))} placeholder={t('profile.birthdate_placeholder')} aria-label="Fecha de nacimiento" />
          ) : (
            <span>{privacy.birthdate ? profile.birthdate : t('profile.private')}</span>
          )}
          {editMode && (
            <label className="block text-xs mt-1">
              <input
                type="checkbox"
                checked={privacy.birthdate}
                onChange={e => setProfile(p => ({
                  ...p,
                  privacy: { ...privacy, birthdate: e.target.checked }
                }))}
              /> {t('profile.show')}
            </label>
          )}
        </div>
      </div>
      {/* Preferencias */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <label className="block text-violet-400 font-semibold mb-1">{t('profile.theme')}</label>
          {editMode ? (
            <select 
              className="bg-neutral-900 border border-violet-700 rounded px-2 py-1 w-full text-white" 
              value={displayProfile.preferences?.theme || 'auto'} 
              onChange={e => setProfile(p => ({ 
                ...p, 
                preferences: { 
                  ...preferences, 
                  theme: e.target.value 
                } 
              }))}
              title={t('profile.select_theme')}
            >
              <option value="auto">{t('profile.auto')}</option>
              <option value="light">{t('profile.light')}</option>
              <option value="dark">{t('profile.dark')}</option>
            </select>
          ) : (
            <span>{preferences.theme === 'auto' ? t('profile.auto') : preferences.theme === 'light' ? t('profile.light') : t('profile.dark')}</span>
          )}
        </div>
        <div>
          <label className="block text-violet-400 font-semibold mb-1">{t('profile.language')}</label>
          {editMode ? (
            <select 
              className="bg-neutral-900 border border-violet-700 rounded px-2 py-1 w-full text-white" 
              value={displayProfile.preferences?.language || 'es'} 
              onChange={e => handleLanguageChange(e.target.value)}
              title={t('profile.select_language')}
            >
              <option value="es">{t('profile.spanish')}</option>
              <option value="en">{t('profile.english')}</option>
            </select>
          ) : (
            <span>{preferences.language === 'es' ? t('profile.spanish') : t('profile.english')}</span>
          )}
        </div>
        <div>
          <label className="block text-violet-400 font-semibold mb-1">{t('profile.visibility')}</label>
          {editMode ? (
            <select 
              className="bg-neutral-900 border border-violet-700 rounded px-2 py-1 w-full text-white" 
              value={displayProfile.preferences?.visibility || 'public'} 
              onChange={e => setProfile(p => ({ 
                ...p, 
                preferences: { 
                  ...preferences, 
                  visibility: e.target.value 
                } 
              }))}
              title={t('profile.select_visibility')}
            >
              <option value="public">{t('profile.public')}</option>
              <option value="private">{t('profile.private')}</option>
            </select>
          ) : (
            <span>{preferences.visibility === 'public' ? t('profile.public') : t('profile.private')}</span>
          )}
        </div>
      </div>
      {/* Actividad */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-violet-400 font-semibold mb-1">{t('profile.member_since')}</label>
          <span>{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</span>
        </div>
        <div>
          <label className="block text-violet-400 font-semibold mb-1">{t('profile.last_connection')}</label>
          <span>{profile.last_seen ? new Date(profile.last_seen).toLocaleString() : '-'}</span>
        </div>
        <div>
          <label className="block text-violet-400 font-semibold mb-1">{t('profile.rooms_created')}</label>
          <span className="font-semibold">{stats.rooms_created}</span>
        </div>
        <div>
          <label className="block text-violet-400 font-semibold mb-1">{t('profile.games_played')}</label>
          <span className="font-semibold">{stats.games_played}</span>
        </div>
      </div>
      {/* Acciones y feedback */}
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {success && <div className="text-green-400 mb-2">{success}</div>}
      <div className="flex gap-2 mt-2">
        {editMode ? (
          <>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-xl font-bold" onClick={handleSave} disabled={loading}>{t('profile.save')}</button>
            <button className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-1 rounded-xl font-bold" onClick={() => { setEditMode(false); setError(''); setSuccess(''); }}>{t('profile.cancel')}</button>
          </>
        ) : (
          <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1 rounded-xl font-bold" onClick={() => setEditMode(true)}>{t('profile.edit')}</button>
        )}
      </div>
    </div>
  );
}