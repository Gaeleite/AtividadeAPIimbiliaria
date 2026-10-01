package br.edu.ifma.imobiliaria.controller;

import br.edu.ifma.imobiliaria.model.Locacao;
import br.edu.ifma.imobiliaria.service.LocacaoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/locacoes")
public class LocacaoController {

    private final LocacaoService service;

    public LocacaoController(LocacaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Locacao> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Locacao> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Locacao> criar(@Valid @RequestBody Locacao obj) {
        Locacao novo = service.salvar(obj);
        return ResponseEntity.created(URI.create("/locacoes/" + novo.getId())).body(novo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Locacao> atualizar(@PathVariable Long id, @Valid @RequestBody Locacao obj) {
        return ResponseEntity.ok(service.atualizar(id, obj));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
