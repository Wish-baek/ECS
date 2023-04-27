package com.ecs.api.config.jwt;

import com.ecs.api.config.oauth.PrincipalDetails;
import com.ecs.api.entity.Users;
import com.ecs.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = jwtTokenProvider.resolveToken(request, "AccessToken");
        String refreshToken=jwtTokenProvider.resolveToken(request, "refreshToken");

        if(token != null ){ // access token 검증
            if(jwtTokenProvider.validationToken(token)){
                Authentication authentication=jwtTokenProvider.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }else{ // access token 만료
                if(jwtTokenProvider.validationToken(refreshToken)){ // refresh token 확인 후 access token 재발급
                    Authentication authentication=jwtTokenProvider.getAuthentication(refreshToken);

                    Users users=userRepository.findByUsersId(((PrincipalDetails)authentication.getPrincipal()).getPassword()).orElseThrow(()->new IllegalArgumentException("유저가 없습니다."));
                    String accessToken=jwtTokenProvider.createToken(users);

                    authentication=jwtTokenProvider.getAuthentication(accessToken);
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    Cookie accessCookie=new Cookie("accessToken", accessToken);
                    accessCookie.setPath("/");
                    accessCookie.setMaxAge(1000 * 60 * 60);

                    response.addCookie(accessCookie);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}