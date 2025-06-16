'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import CountrySelector from '../../../components/CountrySelector'

interface ProfileData {
  id: string
  user_id: string
  username: string
  email: string
  avatar_url: string
  bio?: string
  real_name?: string
  location?: string
  birthdate?: string | null
  privacy: {
    real_name: boolean
    location: boolean
    birthdate: boolean
  }
  preferences: {
    theme: string
    language: string
    visibility: string
  }
  stats: {
    games_played: number
    rooms_created: number
  }
  created_at?: string
  last_seen?: string
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
  birthdate: null,
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
}

export default function ViewUserProfile({
  params,
}: {
  params: { userId: string }
}) {
  const { t } = useTranslation(['profile', 'common'])
  const [profile, setProfile] = useState<ProfileData>(defaultProfileData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError('')

        // Verificar usuario actual
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        // Verificar si es el propio perfil
        const isOwn = currentUser?.id === params.userId
        setIsOwnProfile(isOwn)

        // Si es el propio perfil, redirigir a /profile
        if (isOwn) {
          router.push('/profile')
          return
        }

        // Buscar perfil del usuario
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', params.userId)
          .single<ProfileData>()

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setNotFound(true)
          } else {
            setError('Error al cargar el perfil: ' + profileError.message)
          }
          setLoading(false)
          return
        }

        if (!profileData) {
          setNotFound(true)
          setLoading(false)
          return
        } // Verificar privacidad del perfil
        if (profileData.preferences?.visibility === 'private') {
          setError(t('errors.profilePrivate'))
          setLoading(false)
          return
        }

        // Configurar perfil con valores por defecto
        setProfile({
          ...defaultProfileData,
          ...profileData,
          username: profileData.username || 'Usuario',
          avatar_url: profileData.avatar_url || '/logo.png',
          privacy: profileData.privacy || defaultProfileData.privacy,
          preferences:
            profileData.preferences || defaultProfileData.preferences,
          stats: profileData.stats || defaultProfileData.stats,
        })

        setLoading(false)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Error inesperado al cargar el perfil')
        setLoading(false)
      }
    }

    if (params.userId) {
      fetchProfile()
    }
  }, [params.userId, router, t])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">{t('loadingProfile')}</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>{' '}
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('errors.userNotFound')}
          </h1>
          <p className="text-gray-300 mb-6">{t('errors.userNotFound')}</p>
          <button
            onClick={() => router.back()}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {t('misc.goBack')}
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          {' '}
          <div className="text-6xl mb-4">⚠️</div>{' '}
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('errors.errorLoading')}
          </h1>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {t('misc.goBack')}
          </button>
        </div>
      </div>
    )
  }

  // Extraer datos para fácil acceso
  const privacy = profile.privacy!
  const preferences = profile.preferences!
  const stats = profile.stats!

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4">
        {' '}
        {/* Botón de regreso */}
        <button
          onClick={() => router.back()}
          className="mb-6 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          ← {t('misc.goBack')}
        </button>
        {/* Perfil del usuario */}
        <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-xl border border-violet-700 max-w-2xl w-full mx-auto">
          {/* Información básica */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6 pb-6 border-b border-neutral-700">
            <div className="relative">
              <Image
                src={profile.avatar_url}
                alt={`Avatar de ${profile.username}`}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full border-2 border-violet-500 object-cover shadow-md"
                priority={false}
                sizes="96px"
              />
            </div>

            <div className="text-center sm:text-left">
              <h2
                className="text-2xl font-bold text-violet-400 truncate max-w-xs sm:max-w-md"
                title={profile.username}
              >
                {profile.username}
              </h2>{' '}
              <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-300">
                  {t('publicProfile')}
                </span>
              </div>
            </div>
          </div>{' '}
          {/* Biografía */}
          <div className="mb-6 pb-6 border-b border-neutral-700">
            <label className="block text-violet-400 font-semibold mb-2">
              {t('form.biography')}
            </label>
            <p className="text-gray-300 text-sm leading-relaxed min-h-[3rem]">
              {profile.bio || t('noData.noBiography')}
            </p>
          </div>{' '}
          {/* Información personal (respetando privacidad) */}
          <div className="mb-6 pb-6 border-b border-neutral-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-violet-400 font-semibold mb-1">
                {t('form.realName')}
              </label>
              <span>
                {privacy.real_name
                  ? profile.real_name || t('privacy.notSpecified')
                  : t('privacy.private')}
              </span>
            </div>
            <div>
              <label className="block text-violet-400 font-semibold mb-1">
                {t('form.location')}
              </label>
              <span>
                {privacy.location
                  ? profile.location || t('privacy.notSpecified')
                  : t('privacy.private')}
              </span>
            </div>
            <div>
              <label className="block text-violet-400 font-semibold mb-1">
                {t('form.birthdate')}
              </label>
              <span>
                {privacy.birthdate
                  ? profile.birthdate || t('privacy.notSpecified')
                  : t('privacy.private')}
              </span>
            </div>
          </div>{' '}
          {/* Estadísticas */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-violet-400 font-semibold mb-1">
                {t('activity.memberSince')}
              </label>
              <span>
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : '-'}
              </span>
            </div>
            <div>
              <label className="block text-violet-400 font-semibold mb-1">
                {t('activity.lastConnection')}
              </label>
              <span>
                {profile.last_seen
                  ? new Date(profile.last_seen).toLocaleString()
                  : '-'}
              </span>
            </div>
            <div>
              <label className="block text-violet-400 font-semibold mb-1">
                {t('activity.roomsCreated')}
              </label>
              <span className="font-semibold">{stats.rooms_created}</span>
            </div>
            <div>
              <label className="block text-violet-400 font-semibold mb-1">
                {t('activity.gamesPlayed')}
              </label>
              <span className="font-semibold">{stats.games_played}</span>
            </div>
          </div>
          {/* Información adicional */}
          <div className="text-center text-sm text-gray-400 mt-6 pt-4 border-t border-neutral-700">
            <p>{t('viewingPublicProfile')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
