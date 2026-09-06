'use client'

import { useMutation } from '@tanstack/react-query'
import { logout } from './auth.api'

export const useLogout = () => useMutation({ mutationFn: logout })
