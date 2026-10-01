package br.edu.ifma.imobiliaria.controller;

import br.edu.ifma.imobiliaria.model.Imovel;
import br.edu.ifma.imobiliaria.service.ImovelService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/imoveis")
public class ImovelController {

    private final ImovelService service;

    public ImovelController(ImovelService service) {
        this.service = service;
    }

    @GetMapping
    public List<Imovel> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Imovel> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Imovel> criar(@Valid @RequestBody Imovel obj) {
        Imovel novo = service.salvar(obj);
        return ResponseEntity.created(URI.create("/imoveis/" + novo.getId())).body(novo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Imovel> atualizar(@PathVariable Long id, @Valid @RequestBody Imovel obj) {
        return ResponseEntity.ok(service.atualizar(id, obj));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
