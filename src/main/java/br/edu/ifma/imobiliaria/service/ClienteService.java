package br.edu.ifma.imobiliaria.service;

import br.edu.ifma.imobiliaria.model.Cliente;
import br.edu.ifma.imobiliaria.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    public List<Cliente> listarTodos() {
        return repository.findAll();
    }

    public Cliente buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + id));
    }

    public Cliente salvar(Cliente obj) {
        return repository.save(obj);
    }

    public Cliente atualizar(Long id, Cliente obj) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cliente não encontrado: " + id);
        }
        obj.setId(id);
        return repository.save(obj);
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cliente não encontrado: " + id);
        }
        repository.deleteById(id);
    }
}
