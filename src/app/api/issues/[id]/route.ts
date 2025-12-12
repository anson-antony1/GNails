import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, resolvedBy } = body

    // Validate status
    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update the issue
    const updateData: any = {
      status,
    }

    // If resolving, add resolved timestamp
    if (status === 'resolved') {
      updateData.resolvedAt = new Date()
      if (resolvedBy) {
        updateData.resolvedBy = resolvedBy
      }
    }

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      issue: updatedIssue,
    })
  } catch (error) {
    console.error('Issue update error:', error)
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    )
  }
}
