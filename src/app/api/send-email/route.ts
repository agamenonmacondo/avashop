import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: to, subject, html' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || 'ventas@ccs724.com',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: 'ventas@ccs724.com',
    });

    if (error) {
      throw error;
    }

    console.log('✅ Correo enviado:', data?.id);

    return NextResponse.json({
      success: true,
      id: data?.id,
      message: 'Correo enviado exitosamente',
    });

  } catch (error: any) {
    console.error('❌ Error al enviar correo:', error);
    return NextResponse.json(
      { error: 'Error al enviar correo', details: error.message },
      { status: 500 }
    );
  }
}