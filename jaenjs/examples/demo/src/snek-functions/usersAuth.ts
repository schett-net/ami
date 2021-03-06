import {makeFn} from '@snek-at/functions'

type Sheet = Array<{
  email: string
  password: string
  isActive: boolean
}>

const PROJECT_ID = parseInt(process.env.PROJECT_ID || '') || 2
const SHEETS_TOKEN = process.env.SHEETS_TOKEN
const SHEET_NAME = 'snek-functions-users'

const usersAuth = makeFn<{email: string; password: string}, boolean>(
  async (args, snekApi) => {
    console.log('args', args)

    const {createHash} = await import('crypto')

    // 1. Check if auth sheet exists, and if not, create it with default values
    console.log('sheetsToken', SHEETS_TOKEN)
    try {
      const sheet = await snekApi.getSheet({
        projectId: PROJECT_ID,
        sheetsToken: SHEETS_TOKEN,
        sheetName: SHEET_NAME
      })

      // file to JSON
      const json = await sheet.text()

      // JSON to object
      const obj = JSON.parse(json) as Sheet

      // Find user
      const user = obj.find(u => u.email === args.email)

      if (user && user.isActive) {
        // Check password

        const maybePassword = createHash('sha256')
          .update(args.password)
          .digest('hex')

        if (user.password === maybePassword) {
          return true
        }
      }
    } catch (e) {
      throw e
      throw new Error(`Sheet ${SHEET_NAME} does not exist`)
    }

    return false
  },
  {
    name: 'usersAuth'
  }
)

export default usersAuth
