import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, description, userAgent, url } = body;

    // Validation des données
    if (!email || !subject || !description) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires' },
        { status: 400 }
      );
    }

    // Préparer les données pour Formspree
    const formspreeData = {
      email,
      name: name || 'Non renseigné',
      subject: `[Moneto Bug Report] ${subject}`,
      message: `
**Détails du signalement**

**Nom :** ${name || 'Non renseigné'}
**Email :** ${email}
**Sujet :** ${subject}

**Description :**
${description}

**Informations techniques :**
- **Navigateur :** ${userAgent || 'Non renseigné'}
- **URL :** ${url || 'Non renseigné'}
      `.trim(),
    };

    // Envoyer à Formspree
    const response = await fetch('https://formspree.io/f/mblzyzal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formspreeData),
    });

    if (!response.ok) {
      throw new Error(`Formspree error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Signalement envoyé avec succès via Formspree');

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du signalement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du signalement. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
