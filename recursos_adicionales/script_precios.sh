#!/bin/bash

clear


# Elección del formato
read -p "¿Quieres usar JSON o XML como referencia para obtener los datos? (json/xml): " formato
if [[ $formato = "json" || $formato = "JSON" ]]; then
    echo "Formato JSON elegido"
elif [[ $formato = "xml" || $formato = "XML" ]]; then
    echo "Por ahora solo se admite JSON. Saliendo..."
    exit 1
else
    echo "formato incorrecto. Saliendo..."
    exit 1
fi

# URL de la API JSON
API_URL_JSON="https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/"


# Obtencion de datos del JSON (evitando las tildes)
echo "Obteniendo datos del JSON..."
response=$(curl -s "$API_URL_JSON" | iconv -f utf-8 -t utf-8 -c)

#echo "JSON completo: " $response;


# Extraer todos los tipos de carburantes del primer elemento



# Convertir JSON a array de empresas, tipos de carburante, provincias, municipios y localidades
empresas=$(echo "$response" | jq -r '.ListaEESSPrecio[]."Rótulo"' | sort -u)






<< 'Comment'

# Convertir la lista de carburantes a un array de Bash
carburantes_array=($carburantes)

# Mostrar los tipos de carburantes
echo "Tipos de carburantes:"
for carburante in "${carburantes_array[@]}"; do
    echo "$carburante"
done
echo ""

Comment

# Mostrar los resultados de empresas
echo "Lista de empresas:"
echo "$empresas"
echo ""



read -p "Escribe la empresa que quieres filtrar (o pulsa ENTER para no filtrar): " empresa_filtrada




# Filtrar el JSON si se ingresó una empresa
if [[ -n "$empresa_filtrada" ]]; then
    nuevo_response=$(echo "$response" | jq -r --arg empresa "$empresa_filtrada" \
        '.ListaEESSPrecio[] | select(."Rótulo" == $empresa)')
    if [[ -z "$nuevo_response" ]]; then
        echo "No se encontraron gasolineras para la empresa '$empresa_filtrada'. Manteniendo el JSON original. (No se imprime debido a su larga longitud)"
        nuevo_response=$(echo "$response" | jq -s '.')
    else
        echo "Gasolineras filtradas por la empresa '$empresa_filtrada':"
        nuevo_response=$(echo "$nuevo_response" | jq -s '.')
        echo "$nuevo_response"
    fi
else
    echo "No se ha filtrado por empresa. Manteniendo el JSON original. (No se imprime debido a su larga longitud)"
    nuevo_response=$(echo "$response" | jq -s '.')
fi
echo ""


carburantes=$(echo "$response" | jq -r '.ListaEESSPrecio[0] | to_entries | map(select(.key | startswith("Precio"))) | map(.key | sub("Precio "; "")) | .[]')

# Mostrar los carburantes
echo "Lista de carburantes:"
echo "${carburantes[@]}"
echo ""

read -p "Escribe el carburante que quieres filtrar (o pulsa ENTER para no filtrar): " carburante_filtrado


# Filtrar el JSON si se ingresó un carburante
if [[ -n "$carburante_filtrado" ]]; then
    carburante_key="Precio $carburante_filtrado"
    nuevo_response2=$(echo "$nuevo_response" | jq --arg key "$carburante_key" \
        'map(with_entries(select(.key | startswith("Precio") | not or .key == $key)))')
    if [[ -z "$nuevo_response2" ]]; then
        echo "No se encontraron gasolineras con el carburante '$carburante_filtrado'. Manteniendo el JSON original filtrado por empresa."
        nuevo_response2="$nuevo_response"
    else
        echo "Gasolineras filtradas por el carburante '$carburante_filtrado':"
        echo "$nuevo_response2" | jq -s '.'
    fi
else
    echo "No se ha filtrado por carburante. Manteniendo el JSON original filtrado por empresa."
    nuevo_response2="$nuevo_response"
fi
echo ""


provincias=$(echo "$nuevo_response2" | jq -r '.[]."Provincia"' | sort -u)


echo "Lista de provincias:"
echo "$provincias"

read -p "Escribe la empresa que quieres filtrar: " provincia_filtrada


# Filtrar el JSON si se ingresó una empresa
if [[ -n "$provincia_filtrada" ]]; then
    nuevo_response3=$(echo "$nuevo_response2" | jq -r --arg provincia "$provincia_filtrada" \
        '.[] | select(."Provincia" == $provincia)')
    if [[ -z "$nuevo_response3" ]]; then
        echo "No se encontraron gasolineras para la provincia '$provincia_filtrada'. Manteniendo el JSON anterior. (No se imprime debido a su larga longitud)"
        nuevo_response3=$(echo "$nuevo_response2" | jq -s '.')
    else
        echo "Gasolineras filtradas por la provincia '$provincia_filtrada':"
        nuevo_response3=$(echo "$nuevo_response3" | jq -s '.')
        echo "$nuevo_response3"
    fi
else
    echo "No se ha filtrado por provicia. Manteniendo el JSON anterior. (No se imprime debido a su larga longitud)"
    nuevo_response3=$(echo "$nuevo_response2" | jq -s '.')
fi
echo ""



municipios=$(echo "$nuevo_response3" | jq -r '.[]."Municipio"' | sort -u)


echo "Lista de Municipios:"
echo "$provincias"

read -p "Escribe la empresa que quieres filtrar: " municipio_filtrado


# Filtrar el JSON si se ingresó una empresa
if [[ -n "$municipio_filtrado" ]]; then
    nuevo_response4=$(echo "$nuevo_response3" | jq -r --arg municipio "$municipio_filtrado" \
        '.[] | select(."Municipio" == $municipio)')
    if [[ -z "$nuevo_response4" ]]; then
        echo "No se encontraron gasolineras para el municipio '$municipio_filtrado'. Manteniendo el JSON anterior. (No se imprime debido a su larga longitud)"
        nuevo_response4=$(echo "$nuevo_response3" | jq -s '.')
    else
        echo "Gasolineras filtradas por el municipio '$municipio_filtrado':"
        nuevo_response4=$(echo "$nuevo_response4" | jq -s '.')
        echo "$nuevo_response4"
    fi
else
    echo "No se ha filtrado por municipio. Manteniendo el JSON anterior. (No se imprime debido a su larga longitud)"
    nuevo_response4=$(echo "$nuevo_response3" | jq -s '.')
fi
echo ""



municipios=$(echo "$nuevo_response3" | jq -r '.[]."Municipio"' | sort -u)


echo "Lista de Municipios:"
echo "$provincias"

read -p "Escribe la empresa que quieres filtrar: " municipio_filtrado


# Filtrar el JSON si se ingresó una empresa
if [[ -n "$municipio_filtrado" ]]; then
    nuevo_response4=$(echo "$nuevo_response3" | jq -r --arg municipio "$municipio_filtrado" \
        '.[] | select(."Municipio" == $municipio)')
    if [[ -z "$nuevo_response4" ]]; then
        echo "No se encontraron gasolineras para el municipio '$municipio_filtrado'. Manteniendo el JSON anterior. (No se imprime debido a su larga longitud)"
        nuevo_response4=$(echo "$nuevo_response3" | jq -s '.')
    else
        echo "Gasolineras filtradas por el municipio '$municipio_filtrado':"
        nuevo_response4=$(echo "$nuevo_response4" | jq -s '.')
        echo "$nuevo_response4"
    fi
else
    echo "No se ha filtrado por municipio. Manteniendo el JSON anterior. (No se imprime debido a su larga longitud)"
    nuevo_response4=$(echo "$nuevo_response3" | jq -s '.')
fi
echo ""
