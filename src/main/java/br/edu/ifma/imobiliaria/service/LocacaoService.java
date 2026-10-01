package br.edu.ifma.imobiliaria.service;

import br.edu.ifma.imobiliaria.model.Locacao;
import br.edu.ifma.imobiliaria.repository.LocacaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocacaoService {

    private final LocacaoRepository repository;

    public LocacaoService(LocacaoRepository repository) {
        this.repository = repository;
    }

    public List<Locacao> listarTodos() {
        return repository.findAll();
    }

    public Locacao buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Locacao não encontrado: " + id));
    }

    public Locacao salvar(Locacao obj) {
        return repository.save(obj);
    }

    public Locacao atualizar(Long id, Locacao obj) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Locacao não encontrado: " + id);
        }
        obj.setId(id);
        return repository.save(obj);
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Locacao não encontrado: " + id);
        }
        repository.deleteById(id);
    }
}
