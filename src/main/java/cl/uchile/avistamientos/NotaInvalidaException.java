package cl.uchile.avistamientos;

public class NotaInvalidaException extends RuntimeException {
    public NotaInvalidaException() {
        super("La nota debe ser un número entero entre 1 y 7.");
    }
}