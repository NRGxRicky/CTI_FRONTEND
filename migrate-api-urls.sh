#!/bin/bash

# Script para migrar URLs de API a variables de entorno
# Uso: ./migrate-api-urls.sh

echo "🔄 Iniciando migración de URLs de API..."

# Lista de archivos a migrar
files=(
  "components/BestCategories/BestCategories.js"
  "components/BestCategoriesMini/BestCategoriesMini.js"
  "components/BrandSimilarMini/BrandSimilarMini.js"
  "components/Carousel/CarouselBrand.js"
  "components/Carousel/CarouselProductsV2.js"
  "components/Carousel/CarouselProductsV3.js"
  "components/Carousel/CarouselProductsv4.js"
  "components/Carousel/Standard.js"
  "components/CartConfirmMethod/CartConfirmMethod.js"
  "components/CartPaymentMethod/CartPaymentMethod.js"
  "components/CartShippingMethod/CartShippingMethod.js"
  "components/CartSummary/CartSummary.js"
  "components/CartSummaryMini/CartSummaryMini.js"
  "components/HeaderBar/HeaderBar.tsx"
  "components/HeaderMenu/HeaderMenu.tsx"
  "components/InstantSearch/InstantSearch.js"
  "components/NavMobileMenu/NavMobileMenu.tsx"
  "components/ProfileAddAddress/ProfileAddAddress.js"
  "components/ProfileAddInvoice/ProfileAddInvoice.js"
  "components/ProfileAddressesSection/ProfileAddressesSection.jsx"
  "components/ShippingQuote/ShippingQuote.js"
  "components/SummaryDetails/SummaryDetails.js"
  "components/UserOrdersList/UserOrdersList.jsx"
  "components/UserQuoteDetail/UserQuoteDetail.jsx"
  "components/UserQuotesList/UserQuotesList.jsx"
  "hooks/auth.tsx"
  "hooks/DetailProduct.js"
  "hooks/GetFiltersData.js"
  "hooks/UseOrderDetails.js"
  "hooks/useQuoteDetails.js"
  "pages/carrito/aplazo/canceled.js"
  "pages/carrito/kp/canceled.js"
  "pages/carrito/mp/success.js"
  "pages/compras/confirmacion/index.js"
  "pages/login/forgot-password/[token].js"
  "pages/products/[handle].js"
  "pages/profile/verify-email/[token].js"
  "pages/profile/verify-email/resend-email/index.js"
  "pages/registration/index.js"
)

total=${#files[@]}
current=0

for file in "${files[@]}"; do
  current=$((current + 1))
  echo "[$current/$total] Procesando: $file"
  
  if [ -f "$file" ]; then
    # Crear backup
    cp "$file" "$file.backup"
    
    # Reemplazar URL hardcodeada con variable
    sed -i '' 's|https://api\.pccdnapi\.com||g' "$file"
    
    echo "  ✅ Migrado"
  else
    echo "  ⚠️  Archivo no encontrado"
  fi
done

echo ""
echo "✨ Migración completada!"
echo "📝 Se crearon archivos .backup por seguridad"
echo ""
echo "⚠️  IMPORTANTE: Revisa los cambios y prueba la aplicación antes de eliminar los backups"
echo ""
echo "Para eliminar los backups después de verificar:"
echo "  find . -name '*.backup' -delete"

