-- =========================================================
-- Alternativa ao Database Webhook (contorna o erro
-- "schema supabase_functions does not exist").
-- Rode isso DEPOIS de fazer o deploy da Edge Function com:
--   npx supabase functions deploy notificar-dose-perdida --no-verify-jwt
-- =========================================================

create extension if not exists pg_net with schema extensions;

create or replace function public.notificar_dose_perdida()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'perdido' then
    perform net.http_post(
      url := 'https://cgmwqlphbkledwrujmkw.supabase.co/functions/v1/notificar-dose-perdida',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('record', to_jsonb(new))
    );
  end if;
  return new;
end;
$$;

drop trigger if exists disparar_notificacao_dose_perdida on public.registros_dose;

create trigger disparar_notificacao_dose_perdida
after insert on public.registros_dose
for each row execute function public.notificar_dose_perdida();

-- ---------- Como testar se funcionou ----------
-- Rode esse insert de teste (troque os UUIDs por um medicamento e
-- usuário que já existam nas suas tabelas) e veja se a notificação
-- chega no celular do admin:
--
-- insert into public.registros_dose (medicamento_id, usuario_id, data, status)
-- values ('uuid-de-um-medicamento-existente', 'uuid-do-seu-pai', current_date, 'perdido');
