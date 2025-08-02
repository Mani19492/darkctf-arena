import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Database {
  public: {
    Tables: {
      challenges: {
        Row: {
          id: string
          flag: string
          points: number
          enabled: boolean
        }
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          team_id: string
          challenge_id: string
          flag: string
          is_correct: boolean
          submitted_at: string
        }
        Insert: {
          user_id: string
          team_id: string
          challenge_id: string
          flag: string
          is_correct: boolean
        }
      }
      teams: {
        Row: {
          id: string
          points: number
        }
        Update: {
          points?: number
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user's session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { challengeId, teamId, flag } = await req.json()

    // Validate input
    if (!challengeId || !teamId || !flag) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sanitize flag input
    const sanitizedFlag = flag.trim()
    if (sanitizedFlag.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Flag too long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has already submitted correct flag for this challenge
    const { data: existingSubmission } = await supabaseClient
      .from('submissions')
      .select('is_correct')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .eq('is_correct', true)
      .single()

    if (existingSubmission) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'You have already solved this challenge!',
          alreadySolved: true 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the challenge and its correct flag
    const { data: challenge, error: challengeError } = await supabaseClient
      .from('challenges')
      .select('flag, points, enabled')
      .eq('id', challengeId)
      .eq('enabled', true)
      .single()

    if (challengeError || !challenge) {
      return new Response(
        JSON.stringify({ error: 'Challenge not found or disabled' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate the flag (case-sensitive comparison)
    const isCorrect = sanitizedFlag === challenge.flag

    // Record the submission
    const { error: submissionError } = await supabaseClient
      .from('submissions')
      .insert({
        user_id: user.id,
        team_id: teamId,
        challenge_id: challengeId,
        flag: sanitizedFlag,
        is_correct: isCorrect
      })

    if (submissionError) {
      console.error('Submission error:', submissionError)
      return new Response(
        JSON.stringify({ error: 'Failed to record submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If correct, update team points
    if (isCorrect) {
      const { error: updateError } = await supabaseClient
        .rpc('increment_team_points', { 
          team_id_param: teamId, 
          points_to_add: challenge.points 
        })

      if (updateError) {
        console.error('Points update error:', updateError)
        // Still return success since submission was recorded
      }
    }

    return new Response(
      JSON.stringify({
        success: isCorrect,
        points: isCorrect ? challenge.points : 0,
        message: isCorrect ? 'Correct flag! Points awarded.' : 'Incorrect flag. Try again!'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in validate-flag function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})