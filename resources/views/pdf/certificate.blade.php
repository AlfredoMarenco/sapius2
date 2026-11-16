<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Certificado de Finalización — Sapius</title>
    <style>
        @page {
            size: letter landscape;
            margin: 0;
        }
        * {
            box-sizing: border-box;
        }
        html, body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            color: #101E33;
            background-color: #FFFFFF;
            overflow: hidden;
        }
        .page-wrapper {
            padding: 24px 30px;
            width: 100%;
            page-break-inside: avoid;
            page-break-after: avoid;
        }
        .outer-frame {
            border: 10px solid #1E3A8A;
            padding: 12px;
            background-color: #FFFFFF;
        }
        .inner-frame {
            border: 2px solid #D97706;
            padding: 28px 40px 24px 40px;
            text-align: center;
            background-color: #FFFFFF;
        }
        .logo-container {
            margin-bottom: 14px;
            height: 52px;
        }
        .logo {
            max-height: 50px;
            width: auto;
        }
        .logo-fallback {
            font-size: 32px;
            font-weight: bold;
            color: #101E33;
            letter-spacing: 1px;
        }
        .logo-fallback span {
            color: #FF6B52;
        }
        .title {
            font-size: 34px;
            font-weight: bold;
            color: #1E3A8A;
            margin: 6px 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .subtitle {
            font-size: 16px;
            color: #4B5563;
            margin-bottom: 18px;
        }
        .student-name {
            font-size: 32px;
            font-weight: bold;
            color: #D97706;
            margin: 0 auto 18px auto;
            border-bottom: 2px solid #E5E7EB;
            padding-bottom: 8px;
            width: 75%;
        }
        .course-text {
            font-size: 16px;
            color: #4B5563;
            margin-bottom: 8px;
        }
        .course-name {
            font-size: 24px;
            font-weight: bold;
            color: #1E3A8A;
            margin-bottom: 20px;
        }
        .date {
            font-size: 15px;
            color: #4B5563;
            margin-bottom: 32px;
        }
        .signatures-table {
            width: 90%;
            margin: 10px auto 22px auto;
            border-collapse: collapse;
        }
        .signatures-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding: 0 20px;
        }
        .signature-line {
            border-top: 1.5px solid #1E3A8A;
            width: 75%;
            margin: 0 auto 8px auto;
        }
        .signature-name {
            font-size: 15px;
            font-weight: bold;
            color: #1E3A8A;
        }
        .signature-title {
            font-size: 12px;
            color: #6B7280;
            margin-top: 2px;
        }
        .footer {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed #E5E7EB;
            text-align: center;
            font-size: 11px;
            color: #6B7280;
            line-height: 1.5;
        }
        .validation-code {
            font-weight: bold;
            color: #1E3A8A;
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="page-wrapper">
        <div class="outer-frame">
            <div class="inner-frame">
                <div class="logo-container">
                    @if(!empty($logo_base64))
                        <img src="{{ $logo_base64 }}" class="logo" alt="Sapius">
                    @else
                        <div class="logo-fallback">sapius<span>.</span></div>
                    @endif
                </div>

                <div class="title">Certificado de Finalización</div>

                <div class="subtitle">Este certificado es otorgado orgullosamente a</div>

                <div class="student-name">
                    {{ $student_name }}
                </div>

                <div class="course-text">Por haber completado satisfactoriamente el curso de</div>

                <div class="course-name">
                    {{ $course_name }}
                </div>

                <div class="date">
                    Emitido el día <strong>{{ $issue_date }}</strong>
                </div>

                <table class="signatures-table">
                    <tr>
                        <td>
                            <div class="signature-line"></div>
                            <div class="signature-name">Dirección Académica</div>
                            <div class="signature-title">SAPIUS</div>
                        </td>
                        <td>
                            <div class="signature-line"></div>
                            <div class="signature-name">{{ $instructor_name ?? 'Instructor' }}</div>
                            <div class="signature-title">Instructor del Curso</div>
                        </td>
                    </tr>
                </table>

                <div class="footer">
                    Folio de verificación oficial: <span class="validation-code">{{ $validation_code }}</span>
                    &nbsp;|&nbsp;
                    Emitido por Sapius ({{ config('app.url') }})
                </div>
            </div>
        </div>
    </div>
</body>
</html>
