package cl.uchile.avistamientos;

import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RestController
public class BuscadorController {
    private static final int MAX_LARGO_BUSQUEDA = 80;
    private static final int MAX_RESULTADOS = 20;
    private static final DateTimeFormatter FORMATO_DIA = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    private final AvistamientoRepository avistamientoRepository;
    private final NotaRepository notaRepository;

    BuscadorController(AvistamientoRepository avistamientoRepository, NotaRepository notaRepository) {
        this.avistamientoRepository = avistamientoRepository;
        this.notaRepository = notaRepository;
    }

    @GetMapping("/api/avistamientos/buscar")
    List<ResultadoBusqueda> buscar(@RequestParam(defaultValue = "") String q) {
        String texto = q.trim();
        List<ResultadoBusqueda> resultados = new ArrayList<>();
        if (texto.isEmpty() || texto.length() > MAX_LARGO_BUSQUEDA) {
            return resultados;
        }

        String textoEscapado = texto.replace("!", "!!").replace("%", "!%").replace("_", "!_");

        List<Avistamiento> encontrados =
                avistamientoRepository.buscar(textoEscapado, PageRequest.of(0, MAX_RESULTADOS));

        for (Avistamiento a : encontrados) {
            resultados.add(new ResultadoBusqueda(
                    a.getId(),
                    a.getVoluntario().getNombre(),
                    a.getFechaHora().format(FORMATO_DIA),
                    a.getAve().getNombre(),
                    a.getVoluntario().getComuna().getNombre(),
                    redondear(notaRepository.promedioDe(a.getId()))
            ));
        }
        return resultados;
    }

    @PostMapping("/api/avistamientos/{id}/notas")
    ResultadoNota agregarNota(@PathVariable Integer id, @RequestParam(defaultValue = "") String nota) {
        int valor = validarNota(nota);

        Avistamiento avistamiento = avistamientoRepository.findById(id)
                .orElseThrow(() -> new AvistamientoNoEncontradoException(id));

        notaRepository.save(new Nota(avistamiento, valor));

        return new ResultadoNota(id, redondear(notaRepository.promedioDe(id)));
    }

    private int validarNota(String nota) {
        int valor;
        try {
            valor = Integer.parseInt(nota.trim());
        } catch (NumberFormatException e) {
            throw new NotaInvalidaException();
        }
        if (valor < 1 || valor > 7) {
            throw new NotaInvalidaException();
        }
        return valor;
    }

    private Double redondear(Double promedio) {
        if (promedio == null) {
            return null;
        }
        return Math.round(promedio * 10) / 10.0;
    }
}