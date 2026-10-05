@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if (trim($slot) === 'Laravel')
<img src="{{ asset('/img/v1/logo-sapius.svg') }}" class="logo" alt="Sapius Logo" style="max-width: 25%; height: auto;">
@else
{!! $slot !!}
@endif
</a>
</td>
</tr>
