import { NextResponse } from "next/server";
import { requireAdminRouteAccess } from "@/src/lib/adminRoute";
import { getSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

export async function POST(request: Request) {
    const accessError = await requireAdminRouteAccess();

    if (accessError) {
        return accessError;
    }

    const body = (await request.json().catch(() => null)) as
        | {
              title?: string;
              imageUrl?: string;
              audioUrl?: string;
          }
        | null;

    const title = body?.title?.trim() ?? "";
    const imageUrl = body?.imageUrl?.trim() ?? "";
    const audioUrl = body?.audioUrl?.trim() ?? "";

    if (!title || !imageUrl || !audioUrl) {
        return NextResponse.json({ error: "Title, image URL, and audio URL are required." }, { status: 400 });
    }

    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase.from("content").insert({
            topic_name: "",
            title,
            image_url: imageUrl,
            audio_url: audioUrl,
        });

        if (error) {
            throw error;
        }

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not save content.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const accessError = await requireAdminRouteAccess();

    if (accessError) {
        return accessError;
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("id")?.trim() ?? "";

    if (!contentId) {
        return NextResponse.json({ error: "Content ID is required." }, { status: 400 });
    }

    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase.from("content").delete().eq("id", contentId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not delete content.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
