<x-mail::message>
# Bienvenido(a) al curso

**¡Gracias por iniciar tu inscripción!**

Para finalizar tu proceso, debes realizar el pago en cualquier tienda OXXO. No es necesario imprimir esta ficha.

<x-mail::panel>
### Ficha de Pago OXXOPay

**Monto a pagar:**<br>
<span style="font-size: 24px; font-weight: bold; color: #2d3748;">$ {{ number_format(isset($datos['monto']) ? $datos['monto']/100 : 0, 2) }} MXN</span><br>
<small>OXXO cobrará una comisión adicional al momento de realizar el pago.</small>

<br>

**Referencia:**<br>
<span style="font-size: 28px; font-weight: bold; color: #e53e3e; letter-spacing: 2px;">{{ isset($datos['referencia']) ? join("-", str_split($datos['referencia'], 4)) : '' }}</span>
</x-mail::panel>

### Instrucciones

1. Acude a la tienda OXXO más cercana. [Encuéntrala aquí](https://www.google.com.mx/maps/search/oxxo/).
2. Indica en caja que quieres realizar un pago de **OXXOPay**.
3. Dicta al cajero el número de referencia en esta ficha para que tecleé directamete en la pantalla de venta.
4. Realiza el pago correspondiente con dinero en efectivo.
5. Al confirmar tu pago, el cajero te entregará un comprobante impreso. **En él podrás verificar que se haya realizado correctamente.** Conserva este comprobante de pago.

Al completar estos pasos, nuestro sistema registrará tu pago automáticamente y recibirás un correo confirmando tu acceso.

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
