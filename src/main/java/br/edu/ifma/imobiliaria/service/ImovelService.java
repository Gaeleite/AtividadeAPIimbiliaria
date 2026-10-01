package br.edu.ifma.imobiliaria.service;

import br.edu.ifma.imobiliaria.model.Imovel;
import br.edu.ifma.imobiliaria.repository.ImovelRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImovelService {

    private final ImovelRepository repository;

    public ImovelService(ImovelRepository repository) {
        this.repository = repository;
    }

    public List<Imovel> listarTodos() {
        return repository.findAll();
    }

    public Imovel buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imovel não encontrado: " + id));
    }

    public Imovel salvar(Imovel obj) {
        return repository.save(obj);
    }

    public Imovel atualizar(Long id, Imovel obj) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Imovel não encontrado: " + id);
        }
        obj.setId(id);
        return repository.save(obj);
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Imovel não encontrado: " + id);
        }
        repository.deleteById(id);
    }
}
