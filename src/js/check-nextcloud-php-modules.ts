#!/usr/bin/env zx


const isModuleInstalled = async (moduleName: string) => {
  try {
    const { stdout } = await $`php -m | grep -i ${moduleName}`;
    return !!stdout;
  } catch (e) {
    return false;
  }
}

const phpModules = [
  { name: "ctype", pkgName: "php-ctype" },
  { name: "curl", pkgName: "php-curl" },
  { name: "dom", pkgName: "php-dom" },
  { name: "fileinfo", pkgName: "php-fileinfo" },
  { name: "filter", pkgName: "php-filter" },
  { name: "GD", pkgName: "php-gd" },
  { name: "hash", pkgName: "php-hash" },
  { name: "JSON", pkgName: "php-json" },
  { name: "libxml", pkgName: "php-libxml" },
  { name: "mbstring", pkgName: "php-mbstring" },
  { name: "openssl", pkgName: "php-openssl" },
  { name: "posix", pkgName: "php-posix" },
  { name: "session", pkgName: "php-session" },
  { name: "SimpleXML", pkgName: "php-simplexml" },
  { name: "XMLReader", pkgName: "php-xmlreader" },
  { name: "XMLWriter", pkgName: "php-xmlwriter" },
  { name: "zip", pkgName: "php-pecl-zip" },
  { name: "zlib", pkgName: "php-zlib" },
  { name: "imagick", pkgName: "php-imagick" },
  //{ name: "ffmpeg", pkgName: "ffmpeg" },//{ name: "avconv", pkgName: "avconv" }, //  
  //{ name: "openoffice", pkgName: "openoffice" },//{ name: "libreoffice", pkgName: "libreoffice" }, //  
  { name: "pcntl", pkgName: "php-pcntl" },
  { name: "phar", pkgName: "php-phar" }
];

(async () => {
  for (const module of phpModules) {
    if (!(await isModuleInstalled(module.name))) {
      console.log(`${module.name} モジュールが見つかりません。インストールします。`);
      await $`sudo yum install -y ${module.pkgName}`;
    } else {
      console.log(`${module.name} モジュールはインストール済みです。`);
    }
  }
  echo("PHP モジュールのインストールが完了しました。");
})();
