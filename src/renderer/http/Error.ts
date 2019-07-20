class AbortError extends Error {
  constructor(p) {
    super(p)
  }
}

class AuthError extends Error {
}

export { AbortError, AuthError }
