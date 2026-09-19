import { useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'

type AccountType = 'IN' | 'OUT'
type Page = 'signup' | 'login'

const ugCourses = [
  'B.A.',
  'B.Com',
  'B.Sc (Math Group)',
  'B.Sc (Biology Group)',
]

const pgCourses = ['M.A.', 'M.Com', 'M.Sc']

const pgSubjects = [
  'Political Science',
  'History',
  'Hindi',
  'English',
  'Economics',
  'Sociology',
  'Other',
]

const semesters = [
  '1 Year / Semester 1',
  '1 Year / Semester 2',
  '2 Year / Semester 3',
  '2 Year / Semester 4',
  '3 Year / Semester 5',
  '3 Year / Semester 6',
  '4 Year / Semester 7',
  '4 Year / Semester 8',
]

const days = Array.from({ length: 31 }, (_, i) => i + 1)

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const currentYear = new Date().getFullYear()

const years = Array.from(
  { length: currentYear + 1 - 1800 },
  (_, i) => currentYear - i
)

function App() {
  const [page, setPage] = useState<Page>('login')
  const [accountType, setAccountType] = useState<AccountType>('IN')

  const [academicLevel, setAcademicLevel] = useState('')
  const [course, setCourse] = useState('')
  const [subject, setSubject] = useState('')

  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const [fullName, setFullName] = useState('')
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [email, setEmail] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')

  const [dobDay, setDobDay] = useState('')
  const [dobMonth, setDobMonth] = useState('')
  const [dobYear, setDobYear] = useState('')

  const [gender, setGender] = useState('')

  const [university, setUniversity] = useState('')
  const [college, setCollege] = useState('')
  const [semester, setSemester] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraMode, setCameraMode] =
    useState<'user' | 'environment'>('user')

  const [generatedUsername, setGeneratedUsername] = useState('')

  /* ==============================
     FORGOT PASSWORD STATES
  ============================== */

  const [authScreen, setAuthScreen] =
    useState<'login' | 'forgot' | 'reset'>('login')

  const [resetEmail, setResetEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const isIN = accountType === 'IN'

  const resetMessages = () => {
    setMessage('')
    setError('')
  }

  /* ==============================
     PASSWORD RECOVERY DETECTION
  ============================== */

  useEffect(() => {
    const handleRecovery = () => {
      setAuthScreen('reset')
      setPage('login')
      setError('')
      setMessage('')
    }

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          handleRecovery()
        }
      }
    )

    const hasRecoveryToken =
      window.location.hash.includes(
        'type=recovery'
      ) ||
      window.location.hash.includes(
        'access_token='
      )

    if (hasRecoveryToken) {
      setTimeout(() => {
        handleRecovery()
      }, 100)
    }

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  /* ==============================
     CAMERA
  ============================== */

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop())

      streamRef.current = null
    }

    setCameraOpen(false)
  }

  const startCamera = async (
    mode: 'user' | 'environment'
  ) => {
    try {
      setError('')
      setCameraMode(mode)

      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          'Camera is not supported by this browser.'
        )
        return
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop())
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: mode,
            },
          },
          audio: false,
        })

      streamRef.current = stream
      setCameraOpen(true)

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream

          videoRef.current
            .play()
            .catch(() => {})
        }
      }, 100)

    } catch (err) {
      console.error(err)

      setError(
        'Camera open nahi ho pa raha. Browser me camera permission Allow karein.'
      )

      setCameraOpen(false)
    }
  }

  const takePhoto = () => {
    if (!videoRef.current) return

    const video = videoRef.current

    const canvas =
      document.createElement('canvas')

    canvas.width =
      video.videoWidth || 720

    canvas.height =
      video.videoHeight || 720

    const context =
      canvas.getContext('2d')

    if (!context) return

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )

    canvas.toBlob(
      (blob) => {
        if (!blob) return

        const file = new File(
          [blob],
          `profile-${Date.now()}.jpg`,
          {
            type: 'image/jpeg',
          }
        )

        setPhotoFile(file)

        setPhotoPreview(
          URL.createObjectURL(blob)
        )

        stopCamera()
      },
      'image/jpeg',
      0.9
    )
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          )
      }
    }
  }, [])

  /* ==============================
     PHOTO
  ============================== */

  const handlePhoto = (file?: File) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a valid image.'
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        'Photo must be smaller than 5 MB.'
      )
      return
    }

    setError('')
    setPhotoFile(file)

    const reader = new FileReader()

    reader.onload = () => {
      setPhotoPreview(
        reader.result as string
      )
    }

    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview('')
  }

  /* ==============================
     ACCOUNT TYPE
  ============================== */

  const handleAccountType = (
    type: AccountType
  ) => {
    setAccountType(type)
    resetMessages()
    setGeneratedUsername('')

    if (type === 'OUT') {
      setEnrollmentNumber('')
      setUniversity('')
      setCollege('')
      setAcademicLevel('')
      setCourse('')
      setSubject('')
      setSemester('')
    }
  }

  /* ==============================
     DOB
  ============================== */

  const getDateOfBirth = () => {
    if (
      !dobDay ||
      !dobMonth ||
      !dobYear
    ) {
      return ''
    }

    const day = Number(dobDay)
    const month = Number(dobMonth)
    const year = Number(dobYear)

    const date = new Date(
      year,
      month - 1,
      day
    )

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null
    }

    return `${year}-${String(month).padStart(
      2,
      '0'
    )}-${String(day).padStart(2, '0')}`
  }

  /* ==============================
     SIGNUP VALIDATION
  ============================== */

  const validateForm = () => {
    resetMessages()

    if (!fullName.trim()) {
      setError(
        'Please enter your full name.'
      )
      return false
    }

    if (isIN) {
      if (!enrollmentNumber.trim()) {
        setError(
          'Enrollment number is required for IN account.'
        )
        return false
      }

      if (
        !/^KU[A-Za-z0-9]+$/i.test(
          enrollmentNumber.trim()
        )
      ) {
        setError(
          'Please enter a valid enrollment number.'
        )
        return false
      }

      if (!university) {
        setError(
          'Please select your university.'
        )
        return false
      }

      if (!college) {
        setError(
          'Please select your college/campus.'
        )
        return false
      }

      if (!academicLevel) {
        setError(
          'Please select Under Graduation or Post Graduation.'
        )
        return false
      }

      if (!course) {
        setError(
          'Please select your course/program.'
        )
        return false
      }

      if (
        academicLevel ===
          'Post Graduation' &&
        !subject
      ) {
        setError(
          'Please select your subject.'
        )
        return false
      }

      if (!semester) {
        setError(
          'Please select your year/semester.'
        )
        return false
      }
    }

    if (!email.trim()) {
      setError(
        'Please enter your email address.'
      )
      return false
    }

    if (!mobileNumber.trim()) {
      setError(
        'Please enter your mobile number.'
      )
      return false
    }

    if (
      !/^[0-9]{10}$/.test(
        mobileNumber.trim()
      )
    ) {
      setError(
        'Please enter a valid 10-digit mobile number.'
      )
      return false
    }

    const dob = getDateOfBirth()

    if (dob === null) {
      setError(
        'Please select a valid date of birth.'
      )
      return false
    }

    if (!dob) {
      setError(
        'Please select your complete date of birth.'
      )
      return false
    }

    if (!gender) {
      setError(
        'Please select your gender.'
      )
      return false
    }

    if (password.length < 6) {
      setError(
        'Password must contain at least 6 characters.'
      )
      return false
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        'Password and Confirm Password do not match.'
      )
      return false
    }

    return true
  }

  /* ==============================
     AVATAR UPLOAD
  ============================== */

  const uploadAvatar = async (
    userId: string
  ) => {
    if (!photoFile) return null

    const extension =
      photoFile.name
        .split('.')
        .pop()
        ?.toLowerCase() || 'jpg'

    const filePath =
      `${userId}/profile-${Date.now()}.${extension}`

    const {
      error: uploadError,
    } =
      await supabase.storage
        .from('avatars')
        .upload(
          filePath,
          photoFile,
          {
            cacheControl: '3600',
            upsert: false,
            contentType:
              photoFile.type,
          }
        )

    if (uploadError) {
      throw uploadError
    }

    return filePath
  }

  /* ==============================
     OUT USERNAME
  ============================== */

  const getNextOutUsername = async () => {
    const {
      data,
      error,
    } =
      await supabase.rpc(
        'get_next_out_username'
      )

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error(
        'Could not generate OUT username.'
      )
    }

    return String(data)
  }

  /* ==============================
     SIGNUP
  ============================== */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    resetMessages()
    setGeneratedUsername('')

    try {
      const dob = getDateOfBirth()

      if (!dob) {
        throw new Error(
          'Invalid date of birth.'
        )
      }

      let username = ''

      if (!isIN) {
        username =
          await getNextOutUsername()

        setGeneratedUsername(
          username
        )
      } else {
        username =
          enrollmentNumber
            .trim()
            .toUpperCase()
      }

      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.signUp({
          email:
            email
              .trim()
              .toLowerCase(),
          password,
        })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error(
          'Account could not be created.'
        )
      }

      const userId =
        authData.user.id

      let avatarPath:
        | string
        | null = null

      if (photoFile) {
        avatarPath =
          await uploadAvatar(userId)
      }

      const {
        error: profileError,
      } =
        await supabase
          .from('profiles')
          .insert({
            id: userId,

            account_type:
              accountType,

            account_status:
              isIN
                ? 'active'
                : 'pending',

            username,

            full_name:
              fullName.trim(),

            avatar_url:
              avatarPath,

            email:
              email
                .trim()
                .toLowerCase(),

            mobile_number:
              mobileNumber.trim(),

            date_of_birth:
              dob,

            gender,

            enrollment_number:
              isIN
                ? enrollmentNumber
                    .trim()
                    .toUpperCase()
                : null,

            university_name:
              isIN
                ? university
                : null,

            college_name:
              isIN
                ? college
                : null,

            academic_level:
              isIN
                ? academicLevel
                : null,

            course_program:
              isIN
                ? course
                : null,

            subject:
              isIN &&
              academicLevel ===
                'Post Graduation'
                ? subject
                : null,

            year_semester:
              isIN
                ? semester
                : null,
          })

      if (profileError) {
        await supabase.auth.signOut()
        throw profileError
      }

      if (!isIN) {
        const {
          error: requestError,
        } =
          await supabase
            .from(
              'other_account_requests'
            )
            .insert({
              auth_user_id:
                userId,

              username,

              full_name:
                fullName.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),

              mobile_number:
                mobileNumber.trim(),

              date_of_birth:
                dob,

              gender,

              avatar_url:
                avatarPath,

              status:
                'pending',
            })

        if (requestError) {
          throw requestError
        }

        setMessage(
          `Request submitted successfully. Your Campus Connect username is ${username}. Your account will remain pending until Director approval.`
        )

        setLoading(false)
        return
      }

      setMessage(
        `Account created successfully. Your username is ${username}.`
      )

      setTimeout(() => {
        window.location.href =
          '/dashboard'
      }, 700)

    } catch (err: any) {
      console.error(err)

      let text =
        err?.message ||
        'Something went wrong. Please try again.'

      const lower =
        text.toLowerCase()

      if (
        lower.includes(
          'user already registered'
        )
      ) {
        text =
          'This email is already registered.'
      }

      if (
        lower.includes(
          'password'
        ) &&
        lower.includes(
          '6'
        )
      ) {
        text =
          'Password must contain at least 6 characters.'
      }

      if (
        lower.includes(
          'duplicate'
        ) &&
        lower.includes(
          'mobile'
        )
      ) {
        text =
          'This mobile number is already registered.'
      }

      if (
        lower.includes(
          'duplicate'
        ) &&
        lower.includes(
          'enrollment'
        )
      ) {
        text =
          'This enrollment number is already registered.'
      }

      if (
        lower.includes(
          'duplicate'
        ) &&
        lower.includes(
          'username'
        )
      ) {
        text =
          'This username is already registered.'
      }

      if (
        lower.includes(
          'email rate limit exceeded'
        )
      ) {
        text =
          'Email sending limit reached. Please wait before trying again.'
      }

      setError(text)

    } finally {
      setLoading(false)
    }
  }

  /* ==============================
     LOGIN
  ============================== */

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setError('')
    setMessage('')

    if (!loginId.trim()) {
      setError(
        'Please enter Username, Mobile or Email.'
      )
      return
    }

    if (!loginPassword) {
      setError(
        'Please enter your password.'
      )
      return
    }

    setLoading(true)

    try {
      let emailToLogin = ''

      if (loginId.includes('@')) {
        emailToLogin =
          loginId
            .trim()
            .toLowerCase()
      } else {
        const {
          data,
          error: lookupError,
        } =
          await supabase.rpc(
            'get_login_email',
            {
              p_login_id:
                loginId.trim(),
            }
          )

        if (lookupError) {
          throw lookupError
        }

        if (!data) {
          setError(
            'Username or mobile number not found.'
          )
          return
        }

        emailToLogin =
          String(data)
            .trim()
            .toLowerCase()
      }

      const {
        error: loginError,
      } =
        await supabase.auth
          .signInWithPassword({
            email:
              emailToLogin,
            password:
              loginPassword,
          })

      if (loginError) {
        throw loginError
      }

      const {
        data: profile,
        error: profileError,
      } =
        await supabase
          .from('profiles')
          .select(
            'username, account_type, account_status, full_name'
          )
          .eq(
            'email',
            emailToLogin
          )
          .maybeSingle()

      if (profileError) {
        throw profileError
      }

      if (
        profile?.account_status ===
        'pending'
      ) {
        await supabase.auth.signOut()

        setError(
          'Your account is still pending Director approval.'
        )

        return
      }

      if (
        profile?.account_status ===
        'rejected'
      ) {
        await supabase.auth.signOut()

        setError(
          'Your account request has been rejected.'
        )

        return
      }

      if (
        profile?.account_status ===
        'blocked'
      ) {
        await supabase.auth.signOut()

        setError(
          'Your account has been blocked.'
        )

        return
      }

      setMessage(
        `Login successful. Welcome ${
          profile?.full_name ||
          profile?.username ||
          ''
        }!`
      )

      setTimeout(() => {
        window.location.href =
          '/dashboard'
      }, 700)

    } catch (err: any) {
      console.error(err)

      let text =
        err?.message ||
        'Login failed. Please check your details.'

      const lower =
        text.toLowerCase()

      if (
        lower.includes(
          'invalid login credentials'
        )
      ) {
        text =
          'Wrong password or login details. Please check your username, mobile number, email and password.'
      }

      if (
        lower.includes(
          'email not confirmed'
        )
      ) {
        text =
          'Please confirm your email before logging in.'
      }

      if (
        lower.includes(
          'username or mobile number not found'
        )
      ) {
        text =
          'Username or mobile number not found.'
      }

      setError(text)

    } finally {
      setLoading(false)
    }
  }

  /* ==============================
     SEND RESET EMAIL
  ============================== */

  const handleForgotPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setError('')
    setMessage('')

    if (!resetEmail.trim()) {
      setError(
        'Please enter your registered email address.'
      )
      return
    }

    setLoading(true)

    try {
      const redirectUrl =
        `${window.location.origin}`

      const {
        error: resetError,
      } =
        await supabase.auth
          .resetPasswordForEmail(
            resetEmail
              .trim()
              .toLowerCase(),
            {
              redirectTo:
                redirectUrl,
            }
          )

      if (resetError) {
        throw resetError
      }

      setMessage(
        'Password reset link has been sent to your email. Please check your inbox and spam folder.'
      )

    } catch (err: any) {
      console.error(err)

      let text =
        err?.message ||
        'Unable to send password reset email. Please try again.'

      const lower =
        text.toLowerCase()

      if (
        lower.includes(
          'rate limit'
        )
      ) {
        text =
          'Too many reset requests. Please wait a little and try again.'
      }

      setError(text)

    } finally {
      setLoading(false)
    }
  }

  /* ==============================
     UPDATE NEW PASSWORD
  ============================== */

  const handleUpdatePassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setError('')
    setMessage('')

    if (newPassword.length < 6) {
      setError(
        'New password must contain at least 6 characters.'
      )
      return
    }

    if (
      newPassword !==
      confirmNewPassword
    ) {
      setError(
        'New Password and Confirm Password do not match.'
      )
      return
    }

    setLoading(true)

    try {
      const {
        error: updateError,
      } =
        await supabase.auth.updateUser({
          password:
            newPassword,
        })

      if (updateError) {
        throw updateError
      }

      setMessage(
        'Password updated successfully. You can now login with your new password.'
      )

      setNewPassword('')
      setConfirmNewPassword('')

      await supabase.auth.signOut()

      setTimeout(() => {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        )

        setAuthScreen('login')
        setPage('login')
        setMessage(
          'Password updated successfully. Please login with your new password.'
        )
      }, 1000)

    } catch (err: any) {
      console.error(err)

      setError(
        err?.message ||
          'Unable to update password. Please request a new reset link.'
      )

    } finally {
      setLoading(false)
    }
  }

  /* ==============================
     RESET PASSWORD SCREEN
  ============================== */

  if (
    page === 'login' &&
    authScreen === 'reset'
  ) {
    return (
      <div className="min-h-screen bg-[#031c2b] px-4 py-10 text-white">

        <div className="mx-auto max-w-md">

          <div className="mb-8 text-center">

            <img
              src="/src/assets/campus-connect-logo.png"
              alt="Campus Connect"
              className="mx-auto mb-5 h-32 w-32 rounded-[30px] object-contain"
            />

            <h1 className="text-3xl font-black">
              Create New Password
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Set a new password for your account
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

            {message && (
              <div className="mb-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm leading-5 text-emerald-200">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm leading-5 text-red-200">
                {error}
              </div>
            )}

            <form
              onSubmit={handleUpdatePassword}
              className="space-y-5"
            >

              <div>

                <label className="mb-2 block text-xs font-bold text-cyan-300">
                  New Password
                </label>

                <input
                  type="password"
                  minLength={6}
                  required
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter new password"
                  className="input"
                  disabled={loading}
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-bold text-cyan-300">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  minLength={6}
                  required
                  value={confirmNewPassword}
                  onChange={(e) =>
                    setConfirmNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Re-enter new password"
                  className="input"
                  disabled={loading}
                />

              </div>

              <p className="text-xs text-slate-500">
                Minimum 6 characters
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-400 py-3.5 text-sm font-black text-[#031c2b] transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {loading
                  ? 'Updating Password...'
                  : 'Update Password'}
              </button>

            </form>

          </div>

          <div className="py-6 text-center text-xs text-slate-500">
            Campus Connect • Developed by Sarbaj
          </div>

        </div>

        <style>{`

          .input {
            width: 100%;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.06);
            color: white;
            padding: 13px 14px;
            outline: none;
            font-size: 14px;
          }

          .input::placeholder {
            color: rgb(148 163 184);
          }

          .input:focus {
            border-color: rgba(34,211,238,0.65);
            box-shadow:
              0 0 0 3px rgba(34,211,238,0.08);
          }

          .input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

        `}</style>

      </div>
    )
  }

  /* ==============================
     FORGOT PASSWORD SCREEN
  ============================== */

  if (
    page === 'login' &&
    authScreen === 'forgot'
  ) {
    return (
      <div className="min-h-screen bg-[#031c2b] px-4 py-10 text-white">

        <div className="mx-auto max-w-md">

          <div className="mb-8 text-center">

            <img
              src="/src/assets/campus-connect-logo.png"
              alt="Campus Connect"
              className="mx-auto mb-5 h-32 w-32 rounded-[30px] object-contain"
            />

            <h1 className="text-3xl font-black">
              Forgot Password
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Reset your Campus Connect password
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

            {message && (
              <div className="mb-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm leading-5 text-emerald-200">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm leading-5 text-red-200">
                {error}
              </div>
            )}

            <form
              onSubmit={handleForgotPassword}
              className="space-y-5"
            >

              <div>

                <label className="mb-2 block text-xs font-bold text-cyan-300">
                  Registered Email Address
                </label>

                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) =>
                    setResetEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter your registered email"
                  className="input"
                  disabled={loading}
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-400 py-3.5 text-sm font-black text-[#031c2b] transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {loading
                  ? 'Sending...'
                  : 'Send Reset Link'}
              </button>

            </form>

            <div className="mt-7 text-center">

              <button
                type="button"
                onClick={() => {
                  resetMessages()
                  setAuthScreen('login')
                }}
                className="text-sm font-bold text-cyan-300 hover:underline"
              >
                ← Back to Login
              </button>

            </div>

          </div>

          <div className="py-6 text-center text-xs text-slate-500">
            Campus Connect • Developed by Sarbaj
          </div>

        </div>

        <style>{`

          .input {
            width: 100%;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.06);
            color: white;
            padding: 13px 14px;
            outline: none;
            font-size: 14px;
          }

          .input::placeholder {
            color: rgb(148 163 184);
          }

          .input:focus {
            border-color: rgba(34,211,238,0.65);
            box-shadow:
              0 0 0 3px rgba(34,211,238,0.08);
          }

          .input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

        `}</style>

      </div>
    )
  }

  /* ==============================
     LOGIN SCREEN
  ============================== */

  if (
    page === 'login' &&
    authScreen === 'login'
  ) {
    return (
      <div className="min-h-screen bg-[#031c2b] px-4 py-10 text-white">

        <div className="mx-auto max-w-md">

          <div className="mb-8 text-center">

            <img
              src="/src/assets/campus-connect-logo.png"
              alt="Campus Connect"
              className="mx-auto mb-5 h-32 w-32 rounded-[30px] object-contain"
            />

            <h1 className="text-3xl font-black">
              Student Login
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Welcome to Campus Connect
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

            {message && (
              <div className="mb-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                {message}
              </div>
            )}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              <div>

                <label className="mb-2 block text-xs font-bold text-cyan-300">
                  Username / Mobile / Email
                </label>

                <input
                  type="text"
                  value={loginId}
                  onChange={(e) =>
                    setLoginId(
                      e.target.value
                    )
                  }
                  placeholder="Enter username, mobile or email"
                  className="input"
                  disabled={loading}
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-bold text-cyan-300">
                  Password
                </label>

                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter your password"
                  className="input"
                  disabled={loading}
                />

              </div>

              <div className="flex justify-end -mt-2">

                <button
                  type="button"
                  className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-200 hover:underline"
                  onClick={() => {
                    resetMessages()

                    setResetEmail(
                      loginId.includes('@')
                        ? loginId.trim()
                        : ''
                    )

                    setAuthScreen('forgot')
                  }}
                >
                  Forgot Password?
                </button>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-400 py-3.5 text-sm font-black text-[#031c2b] transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {loading
                  ? 'Signing In...'
                  : 'Sign In'}
              </button>

              {error && (
                <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-center text-sm leading-5 text-red-200">
                  {error}
                </div>
              )}

            </form>

            <div className="mt-7 text-center text-sm text-slate-400">

              Don't have an account?{' '}

              <button
                type="button"
                onClick={() => {
                  setPage('signup')
                  setAuthScreen('login')
                  resetMessages()
                }}
                className="font-bold text-cyan-300"
              >
                Sign up
              </button>

            </div>

          </div>

          <div className="py-6 text-center text-xs text-slate-500">
            Campus Connect • Developed by Sarbaj
          </div>

        </div>

        <style>{`

          .input {
            width: 100%;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.06);
            color: white;
            padding: 13px 14px;
            outline: none;
            font-size: 14px;
          }

          .input::placeholder {
            color: rgb(148 163 184);
          }

          .input:focus {
            border-color: rgba(34,211,238,0.65);
            box-shadow:
              0 0 0 3px rgba(34,211,238,0.08);
          }

          .input:disabled {
            opacity: 0.6;
          }

          .input option {
            background: #0b2435;
            color: white;
          }

          .field-label {
            margin-bottom: 8px;
            display: block;
            font-size: 12px;
            font-weight: 700;
            color: rgb(103 232 249);
          }

        `}</style>

      </div>
    )
  }

  /* ==============================
     SIGNUP SCREEN
  ============================== */

  return (
    <div className="min-h-screen bg-[#031c2b] px-4 py-8 text-white">

      <div className="mx-auto max-w-2xl">

        <div className="mb-8 text-center">

          <img
            src="/src/assets/campus-connect-logo.png"
            alt="Campus Connect"
            className="mx-auto mb-5 h-32 w-32 rounded-[30px] object-contain"
          />

          <h1 className="text-3xl font-black tracking-tight">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Join Campus Connect
          </p>

        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">

          <div className="mb-7 flex rounded-2xl bg-black/20 p-1.5">

            <button
              type="button"
              onClick={() =>
                handleAccountType('IN')
              }
              className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
                isIN
                  ? 'bg-cyan-400 text-[#031c2b]'
                  : 'text-slate-400'
              }`}
            >
              IN • Student
            </button>

            <button
              type="button"
              onClick={() =>
                handleAccountType('OUT')
              }
              className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
                !isIN
                  ? 'bg-cyan-400 text-[#031c2b]'
                  : 'text-slate-400'
              }`}
            >
              OUT • Other
            </button>

          </div>

          {message && (
            <div className="mb-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">

              {message}

              {generatedUsername && (
                <div className="mt-3 rounded-xl bg-black/20 p-3 text-center">

                  <div className="text-xs text-slate-400">
                    Your Campus Connect Username
                  </div>

                  <div className="mt-1 text-xl font-black text-cyan-300">
                    {generatedUsername}
                  </div>

                </div>
              )}

            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            <section>

              <h2 className="mb-4 text-sm font-bold text-cyan-300">
                Profile Photo
              </h2>

              <div className="flex justify-center">

                <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-300/30 bg-white/5">

                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center">

                      <div className="text-3xl">
                        👤
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Photo
                      </div>

                    </div>
                  )}

                </div>

              </div>

              <div className="mt-4 flex justify-center gap-3">

                <label className="cursor-pointer rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-[#031c2b] transition hover:bg-cyan-300">

                  Choose Photo

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={loading}
                    onChange={(e) =>
                      handlePhoto(
                        e.target.files?.[0]
                      )
                    }
                  />

                </label>

                <button
                  type="button"
                  onClick={() =>
                    startCamera('user')
                  }
                  disabled={loading}
                  className="rounded-xl border border-cyan-300/30 px-5 py-2.5 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/10"
                >
                  Camera
                </button>

              </div>

              {photoPreview && (
                <div className="mt-3 text-center">

                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-xs font-semibold text-red-300"
                  >
                    Remove
                  </button>

                </div>
              )}

              <p className="mt-3 text-center text-xs text-slate-500">
                Optional • Maximum 5 MB
              </p>

            </section>

            <section>

              <h2 className="mb-3 text-sm font-bold text-cyan-300">
                Personal Details
              </h2>

              <div className="grid gap-4">

                <div>

                  <label className="field-label">
                    Full Name
                  </label>

                  <input
                    required
                    value={fullName}
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    className="input"
                    disabled={loading}
                  />

                </div>

                {isIN && (
                  <div>

                    <label className="field-label">
                      Enrollment Number
                    </label>

                    <input
                      required
                      value={enrollmentNumber}
                      onChange={(e) =>
                        setEnrollmentNumber(
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Example: KU24119315"
                      className="input"
                      disabled={loading}
                    />

                  </div>
                )}

                <div>

                  <label className="field-label">
                    Email Address
                  </label>

                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="Enter your email address"
                    className="input"
                    disabled={loading}
                  />

                </div>

                <div>

                  <label className="field-label">
                    Mobile Number
                  </label>

                  <input
                    required
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10)
                      )
                    }
                    placeholder="Enter 10-digit mobile number"
                    className="input"
                    disabled={loading}
                  />

                </div>

                <div>

                  <label className="field-label">
                    Date of Birth
                  </label>

                  <div className="grid grid-cols-3 gap-2">

                    <div>

                      <label className="mb-1 block text-[11px] text-slate-500">
                        Day
                      </label>

                      <select
                        required
                        value={dobDay}
                        onChange={(e) =>
                          setDobDay(
                            e.target.value
                          )
                        }
                        className="input"
                        disabled={loading}
                      >

                        <option value="">
                          Day
                        </option>

                        {days.map(
                          (day) => (
                            <option
                              key={day}
                              value={day}
                            >
                              {day}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    <div>

                      <label className="mb-1 block text-[11px] text-slate-500">
                        Month
                      </label>

                      <select
                        required
                        value={dobMonth}
                        onChange={(e) =>
                          setDobMonth(
                            e.target.value
                          )
                        }
                        className="input"
                        disabled={loading}
                      >

                        <option value="">
                          Month
                        </option>

                        {months.map(
                          (
                            month,
                            index
                          ) => (
                            <option
                              key={month}
                              value={index + 1}
                            >
                              {month}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    <div>

                      <label className="mb-1 block text-[11px] text-slate-500">
                        Year
                      </label>

                      <select
                        required
                        value={dobYear}
                        onChange={(e) =>
                          setDobYear(
                            e.target.value
                          )
                        }
                        className="input"
                        disabled={loading}
                      >

                        <option value="">
                          Year
                        </option>

                        {years.map(
                          (year) => (
                            <option
                              key={year}
                              value={year}
                            >
                              {year}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                  </div>

                </div>

                <div>

                  <label className="field-label">
                    Gender
                  </label>

                  <select
                    required
                    value={gender}
                    onChange={(e) =>
                      setGender(
                        e.target.value
                      )
                    }
                    className="input"
                    disabled={loading}
                  >

                    <option value="">
                      Select Gender
                    </option>

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </div>

              </div>

            </section>

            {isIN && (
              <section>

                <h2 className="mb-3 text-sm font-bold text-cyan-300">
                  College & Academic Details
                </h2>

                <div className="grid gap-4">

                  <div>

                    <label className="field-label">
                      University
                    </label>

                    <select
                      required
                      value={university}
                      onChange={(e) =>
                        setUniversity(
                          e.target.value
                        )
                      }
                      className="input"
                      disabled={loading}
                    >

                      <option value="">
                        Select University
                      </option>

                      <option value="Kumaun University, Nainital, Uttarakhand">
                        Kumaun University, Nainital, Uttarakhand
                      </option>

                    </select>

                  </div>

                  <div>

                    <label className="field-label">
                      College / Campus
                    </label>

                    <select
                      required
                      value={college}
                      onChange={(e) =>
                        setCollege(
                          e.target.value
                        )
                      }
                      className="input"
                      disabled={loading}
                    >

                      <option value="">
                        Select College / Campus
                      </option>

                      <option value="H.N.B.P.G. College Khatima">
                        H.N.B.P.G. College Khatima
                      </option>

                    </select>

                  </div>

                  <div>

                    <label className="field-label">
                      Academic Level
                    </label>

                    <select
                      required
                      value={academicLevel}
                      onChange={(e) => {
                        setAcademicLevel(
                          e.target.value
                        )

                        setCourse('')
                        setSubject('')
                      }}
                      className="input"
                      disabled={loading}
                    >

                      <option value="">
                        Select Academic Level
                      </option>

                      <option value="Under Graduation">
                        Under Graduation
                      </option>

                      <option value="Post Graduation">
                        Post Graduation
                      </option>

                    </select>

                  </div>

                  {academicLevel ===
                    'Under Graduation' && (
                    <div>

                      <label className="field-label">
                        Course / Program
                      </label>

                      <select
                        required
                        value={course}
                        onChange={(e) =>
                          setCourse(
                            e.target.value
                          )
                        }
                        className="input"
                        disabled={loading}
                      >

                        <option value="">
                          Select Course / Program
                        </option>

                        {ugCourses.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}

                      </select>

                    </div>
                  )}

                  {academicLevel ===
                    'Post Graduation' && (
                    <>

                      <div>

                        <label className="field-label">
                          Course / Program
                        </label>

                        <select
                          required
                          value={course}
                          onChange={(e) => {
                            setCourse(
                              e.target.value
                            )

                            setSubject('')
                          }}
                          className="input"
                          disabled={loading}
                        >

                          <option value="">
                            Select Course / Program
                          </option>

                          {pgCourses.map(
                            (item) => (
                              <option
                                key={item}
                                value={item}
                              >
                                {item}
                              </option>
                            )
                          )}

                        </select>

                      </div>

                      {course && (
                        <div>

                          <label className="field-label">
                            Subject
                          </label>

                          <select
                            required
                            value={subject}
                            onChange={(e) =>
                              setSubject(
                                e.target.value
                              )
                            }
                            className="input"
                            disabled={loading}
                          >

                            <option value="">
                              Select Subject
                            </option>

                            {pgSubjects.map(
                              (item) => (
                                <option
                                  key={item}
                                  value={item}
                                >
                                  {item}
                                </option>
                              )
                            )}

                          </select>

                        </div>
                      )}

                    </>
                  )}

                  <div>

                    <label className="field-label">
                      Year / Semester
                    </label>

                    <select
                      required
                      value={semester}
                      onChange={(e) =>
                        setSemester(
                          e.target.value
                        )
                      }
                      className="input"
                      disabled={loading}
                    >

                      <option value="">
                        Select Year / Semester
                      </option>

                      {semesters.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

              </section>
            )}

            <section>

              <h2 className="mb-3 text-sm font-bold text-cyan-300">
                Account Security
              </h2>

              <div className="grid gap-4">

                <div>

                  <label className="field-label">
                    Password
                  </label>

                  <input
                    required
                    type="password"
                    minLength={6}
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter password"
                    className="input"
                    disabled={loading}
                  />

                </div>

                <div>

                  <label className="field-label">
                    Confirm Password
                  </label>

                  <input
                    required
                    type="password"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Re-enter your password"
                    className="input"
                    disabled={loading}
                  />

                </div>

              </div>

              <p className="mt-2 text-xs text-slate-500">
                Minimum 6 characters
              </p>

            </section>

            {!isIN && (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs leading-5 text-amber-100">

                <strong>OUT Account:</strong>{' '}
                Your account will receive an
                automatic username such as
                CC01, CC02, CC03 and will remain
                pending until Director approval.

              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-cyan-400 py-3.5 text-sm font-black text-[#031c2b] transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {loading
                ? 'Creating Account...'
                : isIN
                  ? 'Create Account'
                  : 'Submit Account Request'}
            </button>

            {error && (
              <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-center text-sm leading-5 text-red-200">
                {error}
              </div>
            )}

          </form>

          <div className="mt-7 text-center text-sm text-slate-400">

            Already have an account?{' '}

            <button
              type="button"
              onClick={() => {
                setPage('login')
                setAuthScreen('login')
                resetMessages()
              }}
              className="font-bold text-cyan-300 underline-offset-4 hover:underline"
            >
              Log in here
            </button>

          </div>

        </div>

        <div className="py-6 text-center text-xs text-slate-500">
          Campus Connect • Developed by Sarbaj
        </div>

      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#071f2e] p-4 shadow-2xl">

            <div className="mb-4 flex items-center justify-between">

              <h3 className="font-bold">
                Take Profile Photo
              </h3>

              <button
                type="button"
                onClick={stopCamera}
                className="rounded-full bg-white/10 px-3 py-1 text-lg"
              >
                ×
              </button>

            </div>

            <div className="overflow-hidden rounded-2xl bg-black">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-square w-full object-cover"
              />

            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() =>
                  startCamera('user')
                }
                className={`rounded-xl py-2.5 text-sm font-bold ${
                  cameraMode === 'user'
                    ? 'bg-cyan-400 text-[#031c2b]'
                    : 'bg-white/10 text-white'
                }`}
              >
                Front Camera
              </button>

              <button
                type="button"
                onClick={() =>
                  startCamera(
                    'environment'
                  )
                }
                className={`rounded-xl py-2.5 text-sm font-bold ${
                  cameraMode ===
                  'environment'
                    ? 'bg-cyan-400 text-[#031c2b]'
                    : 'bg-white/10 text-white'
                }`}
              >
                Back Camera
              </button>

            </div>

            <button
              type="button"
              onClick={takePhoto}
              className="mt-3 w-full rounded-2xl bg-cyan-400 py-3.5 font-black text-[#031c2b]"
            >
              Take Photo
            </button>

          </div>

        </div>
      )}

      <style>{`

        .input {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.06);
          color: white;
          padding: 13px 14px;
          outline: none;
          font-size: 14px;
        }

        .input::placeholder {
          color: rgb(148 163 184);
        }

        .input:focus {
          border-color: rgba(34,211,238,0.65);
          box-shadow:
            0 0 0 3px rgba(34,211,238,0.08);
        }

        .input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input option {
          background: #0b2435;
          color: white;
        }

        .field-label {
          margin-bottom: 8px;
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: rgb(103 232 249);
        }

      `}</style>

    </div>
  )
}

export default App