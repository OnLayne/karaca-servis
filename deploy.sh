#!/bin/bash
# KARACA Servis Sistemi - GitHub Deploy Script

echo "🚀 KARACA Servis Sistemi GitHub'a yükleniyor..."
echo ""
echo "GitHub kullanıcı adı: OnLayne"
echo "Repo adı: karaca-servis"
echo ""

# Git yapılandırma
git config user.name "KARACA Servis"
git config user.email "servis@karaca.com"

# GitHub remote ekle
git remote remove origin 2>/dev/null
git remote add origin https://github.com/OnLayne/karaca-servis.git

# Branch kontrolü
CURRENT_BRANCH=$(git branch --show-current)
echo "Mevcut branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    git branch -m main
    echo "Branch 'main' olarak değiştirildi"
fi

# Push işlemi
echo ""
echo "GitHub'a gönderiliyor..."
git push -u origin main --force

echo ""
echo "✅ İşlem tamamlandı!"
echo "Site URL: https://onlayne.github.io/karaca-servis/"
