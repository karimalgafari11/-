# سكربت تحديث الخدمات لإزالة Supabase
# يقوم بتحديث جميع ملفات الخدمات

$servicesPath = "services"
$files = Get-ChildItem -Path $servicesPath -Filter "*.ts" -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # تحديث الاستيرادات
    $content = $content -replace "from '../lib/supabaseClient'", "from '../lib/localStorageClient'"
    $content = $content -replace "import \{ supabase,", "import { db,"
    $content = $content -replace "import \{ supabase \}", "import { db }"
    $content = $content -replace "import supabase", "import db"
    
    # تحديث الاستخدامات
    $content = $content -replace "await supabase\.", "await db."
    $content = $content -replace "await \(supabase as any\)", "await (db as any)"
    $content = $content -replace "supabase\.", "db."
    
    # تحديث الأنواع
    $content = $content -replace "from '../types/supabase-types'", "from '../types/database'"
    $content = $content -replace "from '../types/supabase-helpers'", "from '../types/database'"
    
    # حفظ الملف
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Updated: $($file.Name)"
}

Write-Host "`nDone! Updated $($files.Count) files."
