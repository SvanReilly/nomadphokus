# 📸 Nomad Phokus - Guía de Gestión y Uso del Portfolio Fotográfico (en tanto que nivel de usuario final).

¡Bienvenido al sistema de actualización automática de Portfolio Web - Nomad Phokus! No necesitas saber programar para que tus fotos aparezcan en la web. Este documento te explica cómo gestionar tu galería usando solo tu cuenta de **Cloudinary**.

---

## 🚀 Cómo subo mis fotos (Paso a Paso)

Una vez tu 'cloudname' ha sido correctamente establecido en el href del botón que llevará a tu portfolio (se da por hecho por el desarrollador o editor del código) y que la web reconozca tus imágenes y las muestre correctamente, debes seguir estas reglas de nombrado y ubicación:

### 1. Entrar en tu panel
Inicia sesión en tu cuenta de [Cloudinary](https://cloudinary.com/) y dirígete a la **Media Library** (Biblioteca de medios).

### 2. Ubicación de los archivos
Debes navegar hasta la siguiente carpeta:
`sample` > `general`

> **Nota:** Es fundamental que las fotos estén dentro de esa ruta exacta, ya que la web busca los archivos específicamente ahí.

### 3. El secreto: El nombre de los archivos
La web está programada para buscar imágenes con un nombre secuencial. **No uses nombres personalizados** (como "montaña.jpg" o "castillo.png"). 

Renombra tus fotos antes de subirlas siguiendo este patrón:
* `image-1` (Esta será la primera foto que aparezca).
* `image-2`
* `image-3` ... y así sucesivamente.


---

## 🛠️ Preguntas Frecuentes (FAQ)

#### Pero no entiendo, Svån,¿Entonces en qué formato debo subir las fotos?
Puedes subirlas en **AVIF (recomendado), WEBP, JPG, JPEG o PNG**. En caso de subirlas en formato AVIF, exportar desde Lightroom con calidad al 70, y redimensionando con borde largo a 2000px a 72ppp.

#### ¿Tengo que tocar el código de GitHub?
**No.** Una vez que subas la foto a Cloudinary con el nombre correcto (ej. `image-4`), la web la detectará y la publicará automáticamente en la posición de la celda correspondiente la próxima vez que alguien entre.

#### ¿Hay un límite de fotos?
El sistema está configurado para buscar hasta **100 imágenes**. 

#### He subido una foto pero no aparece, ¿qué hago?
1. Verifica que el nombre sea exactamente `image` seguido del número (sin espacios).
2. Asegúrate de que no te has saltado ningún número (si tienes `image1` e `image3`, pero falta `image2`, el sistema se detendrá en la primera).
3. Refresca la página de la web.
4. A veces puede tardar un buen rato en actualizarse, dependiendo de factores que, de forma resumida, escapan al alcance del programa web, pero terminarán viéndose reflejados dichos cambios si has seguido el paso a paso.

---

## 📬 Contacto Técnico
Si el sistema deja de cargar fotos o quieres cambiar la ruta de las carpetas, contacta con el administrador del código (**Svån**) con tu editor de código de confianza a través de los distintos enlaces de contacto presentes en el perfil.

---
*Mantenlo simple. Enfoca tu pensamiento. Captura el momento.*
