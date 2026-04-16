import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env') })

async function checkUser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'shafqatullah.mobify@gmail.com',
    password: 'shafqatullah.mobify@gmail.com'
  })

  if (error) {
    console.error('Login error:', error.message)
    return
  }

  const user = data.user
  console.log('User ID:', user.id)

  const { data: memberships, error: memError } = await supabase
    .from('organization_members')
    .select('*, organizations(*)')
    .eq('user_id', user.id)

  if (memError) {
    console.error('Membership fetch error:', memError.message)
  } else {
    console.log('Memberships found:', memberships.length)
    console.log('Memberships:', JSON.stringify(memberships, null, 2))
  }
}

checkUser()
