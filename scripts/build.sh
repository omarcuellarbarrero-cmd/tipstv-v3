#!/bin/sh
set -e

echo "=== INICIANDO BUILD ==="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo ""

echo "=== VERIFICANDO ARCHIVOS ==="
ls -la /app/
echo ""

echo "=== VERIFICANDO node_modules ==="
ls -la /app/node_modules/.bin/next 2>/dev/null || echo "Next no encontrado en node_modules"
echo ""

echo "=== GENERANDO PRISMA CLIENT ==="
npx prisma generate || echo "Prisma generate falló, continuando..."
echo ""

echo "=== EJECUTANDO NEXT BUILD ==="
npx next build 2>&1 || {
    echo ""
    echo "=== ERROR EN BUILD ==="
    echo "Revisando logs..."
    cat /app/.next/error.log 2>/dev/null || echo "No hay error.log"
    exit 1
}

echo "=== BUILD COMPLETADO ==="
