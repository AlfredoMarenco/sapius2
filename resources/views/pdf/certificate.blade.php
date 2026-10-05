<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Certificado de Finalización</title>
    <style>
        @page {
            margin: 0px;
            padding: 0px;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0px;
            padding: 0px;
            color: #1E3A8A; /* Azul corporativo */
            background-color: #F8FAFC;
        }
        .container {
            width: 100%;
            height: 100%;
            padding: 50px;
            box-sizing: border-box;
            position: relative;
        }
        .border-box {
            border: 15px solid #1E3A8A;
            height: 100%;
            padding: 40px;
            box-sizing: border-box;
            position: relative;
            background-color: #ffffff;
            text-align: center;
        }
        .inner-border {
            border: 2px solid #D97706; /* Color mostaza/dorado */
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
        }
        .logo {
            width: 250px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 45px;
            font-weight: bold;
            color: #1E3A8A;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .subtitle {
            font-size: 20px;
            color: #4B5563;
            margin-bottom: 40px;
        }
        .student-name {
            font-size: 40px;
            font-weight: bold;
            color: #D97706;
            margin-bottom: 30px;
            border-bottom: 2px solid #E5E7EB;
            display: inline-block;
            padding-bottom: 10px;
            min-width: 60%;
        }
        .course-text {
            font-size: 20px;
            color: #4B5563;
            margin-bottom: 15px;
        }
        .course-name {
            font-size: 30px;
            font-weight: bold;
            color: #1E3A8A;
            margin-bottom: 50px;
        }
        .date {
            font-size: 18px;
            color: #4B5563;
            margin-bottom: 50px;
        }
        .signatures {
            width: 100%;
            margin-top: 50px;
        }
        .signature-block {
            width: 45%;
            display: inline-block;
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #1E3A8A;
            width: 80%;
            margin: 0 auto 10px auto;
        }
        .signature-name {
            font-size: 16px;
            font-weight: bold;
            color: #1E3A8A;
        }
        .signature-title {
            font-size: 14px;
            color: #4B5563;
        }
        .footer {
            position: absolute;
            bottom: 30px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #9CA3AF;
        }
        .validation-code {
            font-weight: bold;
            color: #1E3A8A;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="border-box">
            <div class="inner-border">
                <br>
                <!-- Logo -->
                <img src="{{ public_path('images/sapius-logo-color.png') }}" class="logo" alt="Sapius Logo" onerror="this.src='{{ public_path('images/logo.png') }}'">
                
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
                
                <div class="signatures">
                    <div class="signature-block">
                        <div class="signature-line"></div>
                        <div class="signature-name">Dirección Académica</div>
                        <div class="signature-title">SAPIUS</div>
                    </div>
                    <div class="signature-block">
                        <div class="signature-line"></div>
                        <div class="signature-name">{{ $instructor_name ?? 'Instructor' }}</div>
                        <div class="signature-title">Instructor del Curso</div>
                    </div>
                </div>
                
                <div class="footer">
                    Folio de validación: <span class="validation-code">{{ $validation_code }}</span><br>
                    Verifique la autenticidad de este documento en {{ config('app.url') }}/validar
                </div>
            </div>
        </div>
    </div>
</body>
</html>
