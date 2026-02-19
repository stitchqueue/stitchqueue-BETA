import { NextRequest, NextResponse } from 'next/server';
import { checkBOCAccess } from '@/app/lib/server-boc';
import { createServiceRoleClient } from '@/app/lib/supabase-server';
import { calculateMinimumRate } from '@/app/boc/utils/calculations';

const NULL_RESPONSE = {
  hasBOC: false,
  targetRatePerSqIn: null,
  sphRate: null,
  targetHourlyWage: null,
  monthlyOverhead: null,
  projectsPerMonth: null,
  incidentalsMinutes: null,
};

export async function POST(request: NextRequest) {
  try {
    // Authenticate via Authorization header (client passes its session token)
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const token = authHeader.slice(7);

    const supabase = createServiceRoleClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const email = user.email;

    const access = await checkBOCAccess(user.id, email);
    if (!access.hasPurchased) {
      return NextResponse.json(NULL_RESPONSE);
    }

    // Load saved BOC settings
    const { data, error } = await supabase
      .from('boc_settings')
      .select('target_hourly_wage, sph_rate, monthly_overhead, projects_per_month, incidentals_minutes, avg_project_size')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(NULL_RESPONSE);
    }

    const targetHourlyWage = (data.target_hourly_wage as number) ?? 0;
    const sphRate = (data.sph_rate as number) ?? 2000;
    const monthlyOverhead = (data.monthly_overhead as number) ?? 0;
    const projectsPerMonth = (data.projects_per_month as number) ?? 10;
    const incidentalsMinutes = (data.incidentals_minutes as number) ?? 0;
    const avgProjectSize = (data.avg_project_size as number) ?? 6000;

    // Run the same calculation engine the BOC page uses
    const result = calculateMinimumRate({
      targetHourlyWage,
      sphRate,
      monthlyOverhead,
      projectsPerMonth,
      incidentalsMinutes,
      avgProjectSize,
    });

    if (!result.isValid || result.minimumRatePerSqIn <= 0) {
      return NextResponse.json(NULL_RESPONSE);
    }

    return NextResponse.json({
      hasBOC: true,
      targetRatePerSqIn: result.minimumRatePerSqIn,
      sphRate,
      targetHourlyWage,
      monthlyOverhead,
      projectsPerMonth,
      incidentalsMinutes,
    });
  } catch (error) {
    console.error('BOC rate check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
