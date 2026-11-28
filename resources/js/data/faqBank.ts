import type { FaqItem } from '@/components/public/FaqAccordion';

export interface ProgressiveCategory {
    id: string;
    title: string;
    items: FaqItem[];
}

export interface ProgressiveGroup {
    id: 'antes-de-comprar' | 'conoce-tu-preparacion' | 'despues-de-comprar';
    title: string;
    subtitle: string;
    categories: ProgressiveCategory[];
}

export const PROGRESSIVE_FAQ_GROUPS: ProgressiveGroup[] = [
    {
        "id": "antes-de-comprar",
        "title": "Antes de comprar",
        "subtitle": "Productos, fechas, precios, grupos y resultados.",
        "categories": [
            {
                "id": "cat-1",
                "title": "Productos y elección de curso",
                "items": [
                    {
                        "id": "faq-1",
                        "question": "¿Qué opciones de preparación ofrece SAPIUS?",
                        "answer": "En SAPIUS contamos con diferentes herramientas y modalidades de preparación para el EGEL Plus, como guías de estudio, simuladores, paquetes de preparación y cursos completos. Cada opción está diseñada para cubrir distintas necesidades, tiempos y formas de estudio. Podemos ayudarte a identificar cuál se adapta mejor a tu objetivo."
                    },
                    {
                        "id": "faq-2",
                        "question": "¿Cuál es la diferencia entre la Guía, los Simuladores, los paquetes y los Cursos Completos?",
                        "answer": "La Guía es un recurso de apoyo para estudiar y repasar los contenidos. Los Simuladores permiten practicar mediante evaluaciones similares al formato del examen. Los paquetes combinan diferentes herramientas de preparación, mientras que los Cursos Completos ofrecen una preparación más integral. El contenido y los beneficios específicos dependen del producto."
                    },
                    {
                        "id": "faq-3",
                        "question": "¿Qué incluye cada producto?",
                        "answer": "Cada producto tiene características y recursos distintos. Dependiendo de la opción, puede incluir materiales de estudio, simuladores, clases, evaluaciones o acompañamiento académico. Si nos indicas qué producto te interesa, podemos compartirte su contenido y características específicas."
                    },
                    {
                        "id": "faq-4",
                        "question": "¿Qué opción me recomiendan si tengo poco tiempo para estudiar?",
                        "answer": "Depende de cuánto tiempo tengas disponible y de los temas que necesites reforzar. Podemos orientarte para elegir una opción que te permita aprovechar mejor tu tiempo de preparación. Cuéntanos cuándo presentarás tu EGEL y te ayudaremos a identificar una alternativa."
                    },
                    {
                        "id": "faq-5",
                        "question": "¿Qué opción me conviene de acuerdo con mi presupuesto?",
                        "answer": "Tenemos distintas alternativas de preparación. Podemos recomendarte una opción considerando tu presupuesto, el tiempo que tienes para estudiar y el nivel de acompañamiento que buscas. Escríbenos y un asesor podrá explicarte las alternativas disponibles."
                    },
                    {
                        "id": "faq-6",
                        "question": "¿Necesito un curso completo o únicamente simuladores?",
                        "answer": "Depende de tu nivel de preparación. Si necesitas estudiar y reforzar diferentes contenidos, un curso completo puede ser una alternativa adecuada. Si ya estudiaste y buscas practicar, medir tus conocimientos e identificar áreas de oportunidad, los simuladores pueden ayudarte. Un asesor puede orientarte según tu situación."
                    },
                    {
                        "id": "faq-7",
                        "question": "¿Cuál es la diferencia entre el Curso Completo Digital Asincrónico y el Curso Completo Premium?",
                        "answer": "Ambas modalidades están diseñadas para apoyar tu preparación, pero ofrecen experiencias y beneficios diferentes. El Curso Digital Asincrónico permite estudiar mediante contenidos disponibles en la plataforma, mientras que el Premium incorpora beneficios adicionales de acuerdo con el programa correspondiente. Consulta con un asesor el comparativo actualizado de contenidos, materiales y acompañamiento."
                    },
                    {
                        "id": "faq-8",
                        "question": "¿Qué productos están disponibles para EGEL Plus Nutrición y cuáles para EGEL Plus Medicina?",
                        "answer": "La oferta de productos puede variar según la carrera. Contamos con opciones de preparación para EGEL Plus Nutrición y EGEL Plus Medicina. Indícanos cuál examen presentarás para compartirte los productos disponibles y sus características."
                    }
                ]
            },
            {
                "id": "cat-2",
                "title": "Fechas y planeación de estudio",
                "items": [
                    {
                        "id": "faq-9",
                        "question": "¿Todavía estoy a tiempo de prepararme?",
                        "answer": "¡Sí podemos ayudarte a evaluar tus opciones! El tiempo disponible dependerá de la fecha de tu examen y del producto que elijas. Compártenos cuándo presentarás tu EGEL para orientarte sobre la preparación más conveniente."
                    },
                    {
                        "id": "faq-10",
                        "question": "¿Cuándo debería comenzar a estudiar?",
                        "answer": "Lo ideal es comenzar con anticipación para organizar tus sesiones de estudio, revisar los contenidos y practicar con evaluaciones. Sin embargo, también podemos orientarte si tu examen está próximo. Lo importante es identificar cuánto tiempo tienes disponible y establecer una ruta de preparación."
                    },
                    {
                        "id": "faq-11",
                        "question": "¿Cuánto dura el curso?",
                        "answer": "La duración depende del producto y de la modalidad que elijas. Para conocer la duración exacta de tu curso, consulta la descripción del producto o solicita información a un asesor."
                    },
                    {
                        "id": "faq-12",
                        "question": "¿Cuánto tiempo tendré acceso?",
                        "answer": "El periodo de acceso depende del producto adquirido. Antes de realizar tu compra, puedes consultar con un asesor la vigencia correspondiente a la opción que te interesa."
                    },
                    {
                        "id": "faq-13",
                        "question": "¿Puedo apartar mi lugar aunque mi examen sea dentro de varios meses?",
                        "answer": "Las opciones de apartado y sus condiciones dependen de las promociones y políticas vigentes. Contacta a un asesor para conocer si puedes reservar con anticipación y cuáles son los requisitos."
                    },
                    {
                        "id": "faq-14",
                        "question": "¿Qué sucede si mi fecha de EGEL todavía está lejana?",
                        "answer": "Puedes comenzar a planear tu preparación desde ahora. Tener tiempo adicional te permite organizar tus sesiones de estudio y avanzar progresivamente. Un asesor puede ayudarte a elegir un producto considerando la fecha en la que presentarás tu examen."
                    }
                ]
            },
            {
                "id": "cat-3",
                "title": "Precios, promociones y formas de pago",
                "items": [
                    {
                        "id": "faq-15",
                        "question": "¿Cuánto cuesta cada producto?",
                        "answer": "Los precios varían según el producto, la carrera y la modalidad de preparación. Para conocer los precios vigentes, indícanos si presentarás EGEL Plus Nutrición o Medicina y qué opción te interesa."
                    },
                    {
                        "id": "faq-16",
                        "question": "¿Qué incluye el precio?",
                        "answer": "El precio incluye los recursos y beneficios establecidos para cada producto. Estos pueden variar entre guías, simuladores, cursos y paquetes. Antes de comprar, solicita el desglose de lo que incluye la opción que deseas adquirir."
                    },
                    {
                        "id": "faq-17",
                        "question": "¿Tienen promociones?",
                        "answer": "Las promociones pueden cambiar dependiendo de la temporada y de las campañas vigentes. Escríbenos para conocer las promociones disponibles al momento de tu consulta."
                    },
                    {
                        "id": "faq-18",
                        "question": "¿Puedo apartar mi lugar?",
                        "answer": "Las condiciones de apartado dependen del producto y de las políticas vigentes. Un asesor puede confirmarte si aplica, el monto requerido y las fechas para completar tu pago."
                    },
                    {
                        "id": "faq-19",
                        "question": "¿Qué formas de pago manejan?",
                        "answer": "Aceptamos los métodos de pago autorizados por SAPIUS. Para conocer las opciones disponibles, solicita a un asesor la información actualizada."
                    },
                    {
                        "id": "faq-20",
                        "question": "¿Manejan meses sin intereses?",
                        "answer": "La disponibilidad de meses sin intereses depende de las condiciones comerciales y de los métodos de pago vigentes. Consulta con un asesor si esta opción está disponible para el producto que deseas adquirir."
                    }
                ]
            },
            {
                "id": "cat-4",
                "title": "Grupos y universidades",
                "items": [
                    {
                        "id": "faq-21",
                        "question": "¿Manejan descuentos para grupos?",
                        "answer": "Podemos revisar opciones especiales para grupos de estudiantes. Los beneficios y precios preferenciales dependen del número de participantes y de las condiciones de cada propuesta. Contáctanos para solicitar una cotización grupal."
                    },
                    {
                        "id": "faq-22",
                        "question": "¿Cuántas personas necesitamos para obtener un precio preferencial?",
                        "answer": "El número mínimo de participantes y el descuento aplicable deben confirmarse con el equipo comercial. Compártenos cuántas personas están interesadas para revisar las opciones disponibles."
                    },
                    {
                        "id": "faq-23",
                        "question": "¿Qué pasa si somos varios compañeros de la misma universidad?",
                        "answer": "Podemos ayudarte a organizar una propuesta para tu grupo o generación. Si varios compañeros presentarán el mismo EGEL, podemos revisar alternativas de inscripción grupal y posibles beneficios."
                    },
                    {
                        "id": "faq-24",
                        "question": "¿Puedo organizar un grupo de mi generación?",
                        "answer": "¡Por supuesto! Puedes reunir a tus compañeros interesados y contactar a SAPIUS para solicitar información sobre las opciones grupales. Te orientaremos sobre el proceso, los requisitos y las condiciones disponibles."
                    }
                ]
            },
            {
                "id": "cat-5",
                "title": "SAPIUS, expertos y resultados",
                "items": [
                    {
                        "id": "faq-25",
                        "question": "¿Quiénes desarrollan e imparten el contenido?",
                        "answer": "El contenido académico de SAPIUS es desarrollado y respaldado por profesionales especializados en las áreas correspondientes. Puedes solicitar información sobre los especialistas que participan en el programa de tu carrera."
                    },
                    {
                        "id": "faq-26",
                        "question": "¿Qué experiencia tienen los profesionales que participan?",
                        "answer": "Los profesionales involucrados cuentan con experiencia relacionada con sus áreas académicas y de especialidad. Para conocer los perfiles, trayectoria y participación de los expertos de cada programa, consulta la información específica del curso."
                    },
                    {
                        "id": "faq-27",
                        "question": "¿Cuánto tiempo lleva SAPIUS preparando alumnos?",
                        "answer": "SAPIUS cuenta con una trayectoria en la preparación de estudiantes para el EGEL. Para conocer nuestra historia y experiencia institucional, puedes consultar la sección Nosotros de nuestro sitio web."
                    },
                    {
                        "id": "faq-28",
                        "question": "¿Qué resultados han obtenido sus alumnos?",
                        "answer": "Los resultados pueden variar de acuerdo con la preparación y desempeño de cada estudiante. En SAPIUS trabajamos para ofrecer herramientas que apoyen el aprendizaje y la preparación para el examen. Puedes consultar nuestros testimonios y resultados documentados para conocer experiencias de otros alumnos."
                    },
                    {
                        "id": "faq-29",
                        "question": "¿Tienen testimonios de estudiantes?",
                        "answer": "Sí, puedes consultar las experiencias y testimonios compartidos por estudiantes que han formado parte de SAPIUS en nuestros canales oficiales."
                    },
                    {
                        "id": "faq-30",
                        "question": "¿Hay alumnos de mi universidad que hayan tomado el curso?",
                        "answer": "Podemos revisar si contamos con experiencias o grupos de estudiantes de tu universidad. Indícanos el nombre de tu institución para orientarte."
                    },
                    {
                        "id": "faq-31",
                        "question": "¿Cómo sé que SAPIUS es una opción confiable?",
                        "answer": "Te invitamos a conocer nuestra metodología, los contenidos de preparación, los perfiles de nuestros especialistas y las experiencias de nuestros estudiantes. También puedes contactar directamente a nuestro equipo para resolver cualquier duda antes de tomar una decisión."
                    }
                ]
            }
        ]
    },
    {
        "id": "conoce-tu-preparacion",
        "title": "Conoce tu preparación",
        "subtitle": "Metodología, simuladores, plataforma y asesorías.",
        "categories": [
            {
                "id": "cat-6",
                "title": "Contenido y metodología de estudio",
                "items": [
                    {
                        "id": "faq-32",
                        "question": "¿Cómo funciona el Método SUMA?",
                        "answer": "El Método SUMA es una metodología de preparación de SAPIUS diseñada para ayudarte a organizar y fortalecer tu aprendizaje durante el proceso de estudio. Su aplicación y los recursos que lo integran dependen del programa correspondiente."
                    },
                    {
                        "id": "faq-33",
                        "question": "¿Cómo sé qué debo estudiar?",
                        "answer": "Los materiales y recursos de preparación están diseñados para orientarte sobre los contenidos que debes revisar. Dependiendo del producto, podrás apoyarte en guías, clases, referencias y evaluaciones para organizar tu estudio e identificar los temas que necesitas reforzar."
                    },
                    {
                        "id": "faq-34",
                        "question": "¿El material está actualizado?",
                        "answer": "SAPIUS trabaja con contenidos de preparación alineados con las referencias y estructura académica correspondientes al examen. Para conocer la fecha de actualización y la versión de los materiales de tu producto, consulta con un asesor."
                    },
                    {
                        "id": "faq-35",
                        "question": "¿En qué bibliografía o referencias se basa el contenido?",
                        "answer": "Las referencias bibliográficas dependen de la carrera y de los contenidos del programa. Puedes solicitar la bibliografía correspondiente a EGEL Plus Nutrición o EGEL Plus Medicina, según sea tu caso."
                    },
                    {
                        "id": "faq-36",
                        "question": "¿Las clases indican qué capítulos o referencias debo revisar?",
                        "answer": "La orientación sobre lecturas y referencias depende de la estructura de cada programa. En los recursos que incluyen esta guía, podrás identificar los materiales de apoyo para profundizar en los temas correspondientes."
                    },
                    {
                        "id": "faq-37",
                        "question": "¿Cómo se organiza la ruta de estudio?",
                        "answer": "La ruta de estudio depende del producto adquirido. Puede incluir contenidos organizados por temas, materiales de apoyo y evaluaciones que te permiten avanzar en tu preparación. Te recomendamos revisar la estructura de tu programa al iniciar."
                    },
                    {
                        "id": "faq-38",
                        "question": "¿Los cursos incluyen evaluaciones?",
                        "answer": "Algunos productos incluyen evaluaciones o simuladores como parte de sus recursos de preparación. Los componentes específicos dependen de la modalidad que elijas. Consulta la descripción de tu producto para conocer qué evaluaciones incluye."
                    },
                    {
                        "id": "faq-39",
                        "question": "¿Qué diferencia existe entre una guía y un simulador?",
                        "answer": "La guía es un recurso para estudiar, consultar y repasar contenidos. El simulador es una herramienta de práctica que te permite responder preguntas y evaluar tu desempeño. Ambos pueden complementar tu preparación, pero cumplen funciones diferentes."
                    }
                ]
            },
            {
                "id": "cat-7",
                "title": "Simuladores y evaluaciones",
                "items": [
                    {
                        "id": "faq-40",
                        "question": "¿Cómo funcionan los simuladores?",
                        "answer": "Los simuladores te permiten practicar mediante preguntas y evaluaciones relacionadas con los contenidos del examen. Al responderlos, puedes poner a prueba tus conocimientos y familiarizarte con la dinámica de evaluación. Las características específicas dependen del simulador adquirido."
                    },
                    {
                        "id": "faq-41",
                        "question": "¿Los simuladores tienen retroalimentación?",
                        "answer": "La retroalimentación disponible depende del producto y de la configuración del simulador. Algunos recursos pueden ofrecer información para ayudarte a revisar tus respuestas e identificar áreas de oportunidad."
                    },
                    {
                        "id": "faq-42",
                        "question": "¿Cuántos intentos tengo?",
                        "answer": "El número de intentos depende de las condiciones del simulador adquirido. Consulta la descripción de tu producto o contacta a un asesor para conocer la cantidad de intentos disponibles."
                    },
                    {
                        "id": "faq-43",
                        "question": "¿Puedo revisar mis respuestas incorrectas?",
                        "answer": "La posibilidad de revisar respuestas y consultar explicaciones depende de las funciones incluidas en cada simulador."
                    },
                    {
                        "id": "faq-44",
                        "question": "¿Las evaluaciones me ayudan a identificar mis áreas de oportunidad?",
                        "answer": "Sí. Las evaluaciones son una herramienta para reconocer los temas que dominas y aquellos que necesitas reforzar. Te recomendamos utilizarlas como parte de tu proceso de estudio y no únicamente como una medición final."
                    }
                ]
            },
            {
                "id": "cat-8",
                "title": "Modalidad y plataforma",
                "items": [
                    {
                        "id": "faq-45",
                        "question": "¿Las clases son en vivo o grabadas?",
                        "answer": "La modalidad depende del producto que elijas. Los cursos asincrónicos utilizan contenidos grabados para que puedas consultarlos según tu disponibilidad. Otras modalidades pueden incluir actividades o sesiones adicionales. Consulta las características de tu curso."
                    },
                    {
                        "id": "faq-46",
                        "question": "¿Puedo estudiar a mi propio ritmo?",
                        "answer": "En la modalidad digital asincrónica puedes organizar tus tiempos de estudio y avanzar de acuerdo con tu disponibilidad, respetando siempre el periodo de acceso y las condiciones de tu producto."
                    },
                    {
                        "id": "faq-47",
                        "question": "¿La plataforma está disponible las 24 horas?",
                        "answer": "La disponibilidad de acceso depende de las condiciones técnicas y de la vigencia de tu producto."
                    },
                    {
                        "id": "faq-48",
                        "question": "¿Puedo ingresar desde computadora o dispositivo móvil?",
                        "answer": "La compatibilidad depende de los requisitos de la plataforma."
                    },
                    {
                        "id": "faq-49",
                        "question": "¿Cómo funciona la plataforma?",
                        "answer": "Una vez que recibas tus datos de acceso, podrás ingresar a la plataforma y consultar los recursos correspondientes a tu producto. La organización de contenidos y herramientas dependerá de la modalidad adquirida."
                    }
                ]
            },
            {
                "id": "cat-9",
                "title": "Asesorías y acompañamiento académico",
                "items": [
                    {
                        "id": "faq-50",
                        "question": "¿Tengo asesoría durante mi preparación?",
                        "answer": "El acompañamiento académico depende del producto que hayas adquirido. Algunas modalidades pueden incluir asesorías u otros recursos de apoyo, mientras que otras están diseñadas para un estudio independiente. Consulta los beneficios de tu curso."
                    },
                    {
                        "id": "faq-51",
                        "question": "¿Puedo hacer preguntas sobre los temas?",
                        "answer": "Las opciones para resolver dudas académicas dependen del nivel de acompañamiento incluido en tu producto. Si tu modalidad contempla asesoría, podrás utilizar los canales establecidos para recibir apoyo."
                    },
                    {
                        "id": "faq-52",
                        "question": "¿Hay asesorías en vivo?",
                        "answer": "La disponibilidad de asesorías en vivo depende del programa y de la modalidad contratada."
                    },
                    {
                        "id": "faq-53",
                        "question": "¿Por dónde puedo resolver mis dudas?",
                        "answer": "Puedes comunicarte con el equipo de SAPIUS a través de nuestros canales oficiales de atención. Si tu producto incluye acompañamiento académico, un asesor te indicará el canal correspondiente para resolver tus dudas."
                    },
                    {
                        "id": "faq-54",
                        "question": "¿Cuál es el horario de atención?",
                        "answer": "Nuestro horario de atención es:"
                    },
                    {
                        "id": "faq-55",
                        "question": "¿Qué diferencia existe entre estudiar de manera independiente y tener acompañamiento?",
                        "answer": "El estudio independiente te permite organizar tu preparación de manera autónoma utilizando los recursos disponibles. El acompañamiento incorpora opciones adicionales de orientación y resolución de dudas, de acuerdo con las características del producto."
                    },
                    {
                        "id": "faq-56",
                        "question": "¿Todos los productos incluyen el mismo nivel de acompañamiento?",
                        "answer": "No necesariamente. El nivel de acompañamiento varía según el producto y la modalidad. Antes de comprar, te recomendamos revisar qué tipo de apoyo académico está incluido."
                    }
                ]
            }
        ]
    },
    {
        "id": "despues-de-comprar",
        "title": "Después de comprar",
        "subtitle": "Accesos, facturación, envíos y garantía.",
        "categories": [
            {
                "id": "cat-10",
                "title": "Accesos, pagos y facturación",
                "items": [
                    {
                        "id": "faq-57",
                        "question": "¿Cómo confirmo mi pago?",
                        "answer": "Una vez realizado tu pago, sigue las instrucciones de confirmación proporcionadas por SAPIUS. Si necesitas verificar que fue recibido, puedes enviar tu comprobante a través del canal de atención indicado por nuestro equipo."
                    },
                    {
                        "id": "faq-58",
                        "question": "¿Cuándo recibo mi acceso después de comprar?",
                        "answer": "El tiempo de activación depende del proceso de validación del pago y del producto adquirido. Una vez confirmada tu compra, recibirás las instrucciones para acceder a los recursos correspondientes."
                    },
                    {
                        "id": "faq-59",
                        "question": "¿Qué debo hacer después de realizar mi compra?",
                        "answer": "Después de realizar tu pago, sigue estos pasos:\n1. Envía tu comprobante por el canal indicado.\n2. Proporciona los datos solicitados para registrar tu compra.\n3. Espera la confirmación de tu pago.\n4. Recibe las instrucciones y datos de acceso, según corresponda.\n5. Ingresa a tu plataforma y comienza tu preparación."
                    },
                    {
                        "id": "faq-60",
                        "question": "¿Qué sucede cuando termina mi periodo de acceso?",
                        "answer": "Al finalizar la vigencia de tu producto, el acceso a los recursos puede dejar de estar disponible. Las condiciones de renovación o extensión, si existen, deben consultarse con el equipo de SAPIUS."
                    },
                    {
                        "id": "faq-61",
                        "question": "¿Facturan?",
                        "answer": "Para conocer las opciones de facturación y los requisitos fiscales, puedes solicitar información a nuestro equipo administrativo."
                    },
                    {
                        "id": "faq-62",
                        "question": "¿Cómo solicito mi factura?",
                        "answer": "Comunícate con el equipo administrativo de SAPIUS y solicita tu factura. Deberás proporcionar los datos fiscales requeridos y la información de tu compra."
                    },
                    {
                        "id": "faq-63",
                        "question": "¿Qué datos necesito proporcionar para facturar?",
                        "answer": "Generalmente se solicitan datos fiscales como RFC, razón social o nombre, régimen fiscal, código postal y uso de CFDI, además de la información de la compra. El equipo administrativo te indicará los requisitos vigentes."
                    }
                ]
            },
            {
                "id": "cat-11",
                "title": "Material físico, envíos y garantía",
                "items": [
                    {
                        "id": "faq-64",
                        "question": "¿El Curso Completo Premium de Nutrición incluye material físico?",
                        "answer": "El Curso Completo Premium de Nutrición contempla materiales físicos de acuerdo con las características establecidas para ese producto. Para conocer el contenido exacto del paquete, consulta la descripción vigente o solicita información a un asesor."
                    },
                    {
                        "id": "faq-65",
                        "question": "¿Qué materiales voy a recibir?",
                        "answer": "Los materiales incluidos dependen de la versión del Curso Completo Premium de Nutrición."
                    },
                    {
                        "id": "faq-66",
                        "question": "¿Realizan envíos a todo México?",
                        "answer": "La cobertura de envío depende de las condiciones logísticas y del destino."
                    },
                    {
                        "id": "faq-67",
                        "question": "¿Cuánto tarda mi envío?",
                        "answer": "El tiempo de entrega depende del destino, la paquetería y la fecha de procesamiento del pedido."
                    },
                    {
                        "id": "faq-68",
                        "question": "¿Cómo puedo rastrear mi paquete?",
                        "answer": "Cuando tu pedido sea enviado, se te proporcionará la información de seguimiento correspondiente, si el servicio de paquetería cuenta con esta opción."
                    },
                    {
                        "id": "faq-69",
                        "question": "¿El envío tiene algún costo adicional?",
                        "answer": "El costo de envío depende de las condiciones de compra y del destino."
                    },
                    {
                        "id": "faq-70",
                        "question": "¿Qué datos necesitan para realizar el envío?",
                        "answer": "Generalmente se solicitan nombre completo, teléfono de contacto, dirección completa, código postal, ciudad, estado y referencias para localizar el domicilio. El equipo de SAPIUS te indicará los datos necesarios para procesar tu envío."
                    },
                    {
                        "id": "faq-71",
                        "question": "¿Qué productos cuentan con garantía?",
                        "answer": "La garantía aplica únicamente para el Curso Completo Premium de EGEL Plus Nutrición, de acuerdo con los términos y condiciones establecidos para ese producto."
                    },
                    {
                        "id": "faq-72",
                        "question": "¿Qué cubre la garantía?",
                        "answer": "La cobertura depende de los términos y condiciones específicos de la garantía. Para conocer qué situaciones contempla y cuáles son sus alcances, consulta el documento oficial correspondiente."
                    },
                    {
                        "id": "faq-73",
                        "question": "¿Qué requisitos debo cumplir para hacerla válida?",
                        "answer": "Para solicitar la aplicación de la garantía, debes cumplir con los requisitos y condiciones establecidos en sus términos y condiciones. Te recomendamos revisar el documento antes de realizar tu compra."
                    },
                    {
                        "id": "faq-74",
                        "question": "¿Dónde puedo consultar los términos y condiciones?",
                        "answer": "Puedes solicitar los términos y condiciones oficiales al equipo de SAPIUS o consultar el documento disponible en nuestro sitio web."
                    }
                ]
            }
        ]
    }
];
