# Meu Controle de Medicamentos

App mobile para lembrar horários de medicamentos e acompanhar, à distância, se foram tomados.
Criado para ajudar meu pai, que toma vários remédios por dia.

## O que faz
- Login com dois perfis: **usuário** (quem toma os remédios) e **admin** (quem acompanha)
- Alerta na tela e alarme que repete até confirmar "Tomei"
- Acompanhamento em tempo real: tomado, pendente ou não tomou
- Aviso para o admin quando uma dose passa de 30 minutos sem confirmação (em teste)

## Tecnologias
React Native · Expo (SDK 54) · Supabase (Auth, Postgres com RLS, Realtime, pg_cron, Edge Functions) · EAS Build

## Como rodar
```bash
npm install
npx expo start
```
Use o Expo Go (versão do SDK 54) ou um emulador Android.
As notificações push só funcionam no APK gerado pelo EAS, não no Expo Go.

## Banco de dados
Os scripts estão em `supabase/` (schema, trigger e Edge Function).
A chave pública (publishable) fica em `src/utils/supabase.js`. A chave secreta **nunca** vai para o código.

## Gerar o APK
```bash
npx eas-cli build -p android --profile preview
```
