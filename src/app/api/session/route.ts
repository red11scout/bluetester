import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import {
  createSession,
  getSession,
  updateSession,
  saveScenarioToSession,
  deleteScenarioFromSession,
  trackEvent,
  generateId
} from '@/lib/db'

// GET - Get or create session
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value

    if (sessionId) {
      const session = await getSession(sessionId)
      if (session) {
        await trackEvent(sessionId, 'session_resumed')
        return NextResponse.json({ session })
      }
    }

    // Create new session
    const newSessionId = uuidv4()
    const session = await createSession(newSessionId)

    await trackEvent(newSessionId, 'session_created')

    const response = NextResponse.json({ session })
    response.cookies.set('session_id', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error('Session GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    )
  }
}

// PUT - Update session
export async function PUT(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { filters, settings } = body

    const updates: Record<string, any> = {}
    if (filters) updates.filters = filters
    if (settings) updates.settings = settings

    const session = await updateSession(sessionId, updates)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    await trackEvent(sessionId, 'session_updated', { updates: Object.keys(updates) })

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Session PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

// POST - Save scenario to session
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, scenario, scenarioId } = body

    if (action === 'save_scenario' && scenario) {
      const savedScenario = {
        id: generateId(),
        name: scenario.name,
        description: scenario.description,
        assumptions: scenario.assumptions,
        createdAt: new Date()
      }

      const success = await saveScenarioToSession(sessionId, savedScenario)

      if (success) {
        await trackEvent(sessionId, 'scenario_saved', {
          scenarioName: scenario.name
        })
        return NextResponse.json({ success: true, scenario: savedScenario })
      } else {
        return NextResponse.json(
          { error: 'Failed to save scenario' },
          { status: 500 }
        )
      }
    }

    if (action === 'delete_scenario' && scenarioId) {
      const success = await deleteScenarioFromSession(sessionId, scenarioId)

      if (success) {
        await trackEvent(sessionId, 'scenario_deleted', { scenarioId })
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: 'Failed to delete scenario' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Session POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
