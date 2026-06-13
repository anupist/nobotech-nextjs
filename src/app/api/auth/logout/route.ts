import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // In a real app, this would clear the session/token
    // For demo purposes, we just return success
    return NextResponse.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
