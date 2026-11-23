package cl.uchile.avistamientos;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ErroresAdvice {

    @ExceptionHandler(NotaInvalidaException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    String notaInvalida(NotaInvalidaException ex) {
        return ex.getMessage();
    }

    @ExceptionHandler(AvistamientoNoEncontradoException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    String avistamientoNoEncontrado(AvistamientoNoEncontradoException ex) {
        return ex.getMessage();
    }
}